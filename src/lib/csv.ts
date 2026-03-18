/**
 * Parse CSV text into an array of objects using the header row as keys.
 * Handles quoted fields containing commas and escaped quotes.
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = parseCSVLines(text);
  if (lines.length < 2) return [];

  const headers = lines[0];
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 0 || (values.length === 1 && values[0] === ""))
      continue;

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = j < values.length ? values[j] : "";
    }
    results.push(row);
  }

  return results;
}

function parseCSVLines(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          // Escaped quote
          field += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        current.push(field);
        field = "";
        i++;
      } else if (ch === "\r") {
        // Handle \r\n or standalone \r
        current.push(field);
        field = "";
        rows.push(current);
        current = [];
        i++;
        if (i < text.length && text[i] === "\n") i++;
      } else if (ch === "\n") {
        current.push(field);
        field = "";
        rows.push(current);
        current = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Push last field/row
  if (field || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

interface LMSExportRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  evaluation: string;
  reason: string;
  additionalInfo: string;
}

/**
 * Generate a Red Cross LMS format CSV from structured data.
 */
export function generateLMSExportCSV(data: LMSExportRow[]): string {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Evaluation",
    "Reason",
    "Additional Info",
  ];

  const rows = data.map((row) => [
    row.firstName,
    row.lastName,
    row.email,
    row.phone,
    row.evaluation,
    row.reason,
    row.additionalInfo,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCSVField).join(",")).join("\n");
}

function escapeCSVField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
