import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Parse a CSV string into rows of string arrays.
 * Handles quoted fields (including commas and newlines within quotes)
 * and double-quote escaping ("").
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(current.trim());
        current = "";
        if (row.some((cell) => cell !== "")) {
          rows.push(row);
        }
        row = [];
        if (char === "\r") i++; // skip \n in \r\n
      } else {
        current += char;
      }
    }
  }

  // Push last field and row
  if (current !== "" || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Upload a CSV file with the field name 'file'." },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain a header row and at least one data row." },
        { status: 400 }
      );
    }

    // Normalize header names
    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Map header names to column indices
    const colIndex = (name: string): number => {
      const variations: Record<string, string[]> = {
        firstname: ["first name", "firstname", "first_name"],
        lastname: ["last name", "lastname", "last_name"],
        email: ["email", "e-mail"],
        phone: ["phone", "phone number", "phonenumber"],
        dob: ["dob", "date of birth", "dateofbirth", "date_of_birth", "birthday"],
        parentname: ["parent name", "parentname", "parent_name"],
        parentemail: ["parent email", "parentemail", "parent_email"],
        classid: ["class id", "classid", "class_id"],
        sgaregid: ["sga registration id", "sgaregid", "sga_registration_id", "sga id", "sgaid"],
      };

      const keys = variations[name] ?? [name];
      for (const key of keys) {
        const idx = headers.indexOf(key);
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const firstNameIdx = colIndex("firstname");
    const lastNameIdx = colIndex("lastname");
    const emailIdx = colIndex("email");
    const phoneIdx = colIndex("phone");
    const dobIdx = colIndex("dob");
    const parentNameIdx = colIndex("parentname");
    const parentEmailIdx = colIndex("parentemail");
    const classIdIdx = colIndex("classid");
    const sgaRegIdIdx = colIndex("sgaregid");

    if (firstNameIdx === -1 || lastNameIdx === -1 || emailIdx === -1) {
      return NextResponse.json(
        { error: "CSV must contain 'First Name', 'Last Name', and 'Email' columns." },
        { status: 400 }
      );
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // 1-indexed, accounting for header

      try {
        const firstName = row[firstNameIdx] ?? "";
        const lastName = row[lastNameIdx] ?? "";
        const email = row[emailIdx] ?? "";

        if (!firstName || !lastName || !email) {
          errors.push(`Row ${rowNum}: Missing required field (firstName, lastName, or email)`);
          continue;
        }

        const phone = phoneIdx !== -1 ? row[phoneIdx] || null : null;
        const dob = dobIdx !== -1 && row[dobIdx] ? new Date(row[dobIdx]) : null;
        const parentName = parentNameIdx !== -1 ? row[parentNameIdx] || null : null;
        const parentEmail = parentEmailIdx !== -1 ? row[parentEmailIdx] || null : null;
        const classId = classIdIdx !== -1 ? row[classIdIdx] || null : null;
        const sgaRegId = sgaRegIdIdx !== -1 ? row[sgaRegIdIdx] || null : null;

        // Validate DOB if present
        if (dob && isNaN(dob.getTime())) {
          errors.push(`Row ${rowNum}: Invalid date of birth`);
          continue;
        }

        // Validate classId exists
        if (classId) {
          const classExists = await db.class.findUnique({
            where: { id: classId },
            select: { id: true },
          });
          if (!classExists) {
            errors.push(`Row ${rowNum}: Class ID '${classId}' not found`);
            continue;
          }
        } else {
          errors.push(`Row ${rowNum}: No Class ID provided`);
          continue;
        }

        // Upsert student by email (find existing, then create or update)
        const existing = await db.student.findFirst({
          where: { email },
        });

        const student = existing
          ? await db.student.update({
              where: { id: existing.id },
              data: {
                firstName,
                lastName,
                phone: phone ?? undefined,
                dateOfBirth: dob ?? undefined,
                parentName: parentName ?? undefined,
                parentEmail: parentEmail ?? undefined,
                sgaRegistrationId: sgaRegId ?? undefined,
              },
            })
          : await db.student.create({
              data: {
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: dob,
                parentName,
                parentEmail,
                sgaRegistrationId: sgaRegId,
              },
            });

        // Create enrollment
        await db.enrollment.create({
          data: {
            studentId: student.id,
            classId,
            status: "REGISTERED",
          },
        });

        imported++;
      } catch (rowError) {
        const message = rowError instanceof Error ? rowError.message : String(rowError);
        errors.push(`Row ${rowNum}: ${message}`);
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (error) {
    console.error("Failed to import CSV:", error);
    return NextResponse.json(
      { error: "Failed to import CSV" },
      { status: 500 }
    );
  }
}
