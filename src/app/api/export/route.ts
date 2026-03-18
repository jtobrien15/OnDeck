import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateLMSExportCSV } from "@/lib/csv";

export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "classId query parameter is required" },
        { status: 400 }
      );
    }

    // Load the class to get its name for the filename
    const cls = await db.class.findUnique({
      where: { id: classId },
    });

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Load all enrollments with COMPLETED or DID_NOT_COMPLETE status
    const enrollments = await db.enrollment.findMany({
      where: {
        classId,
        status: { in: ["COMPLETED", "DID_NOT_COMPLETE"] },
      },
      include: {
        student: true,
      },
    });

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: "No completed enrollments found for this class" },
        { status: 404 }
      );
    }

    // Map to Red Cross LMS format
    const rows = enrollments.map((enrollment) => ({
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      email: enrollment.student.email,
      phone: enrollment.student.phone ?? "",
      evaluation:
        enrollment.status === "COMPLETED"
          ? "Successful completion"
          : enrollment.courseResult ?? "",
      reason: enrollment.courseResultReason ?? "",
      additionalInfo: enrollment.additionalInfo ?? "",
    }));

    const csv = generateLMSExportCSV(rows);

    // Build a descriptive filename
    const dateStr = cls.startDate.toISOString().split("T")[0];
    const filename = `lms-export-${cls.courseType}-${dateStr}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate CSV export:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV export" },
      { status: 500 }
    );
  }
}
