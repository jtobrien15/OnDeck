"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface ClassOption {
  id: string;
  courseType: string;
  location: string;
  startDate: string;
  endDate: string;
  scheduleDetails: string;
  status: string;
  _count: { enrollments: number };
}

interface EnrollmentPreview {
  id: string;
  status: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

export default function ExportPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [preview, setPreview] = useState<EnrollmentPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data: ClassOption[] = await res.json();

        // Filter to COMPLETED or IN_PROGRESS classes (likely to have finalized enrollments)
        const filtered = data.filter(
          (c) => c.status === "COMPLETED" || c.status === "IN_PROGRESS"
        );
        setClasses(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load classes");
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // Fetch preview when class is selected
  useEffect(() => {
    if (!selectedClassId) {
      setPreview([]);
      return;
    }

    async function fetchPreview() {
      setPreviewLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/classes/${selectedClassId}`);
        if (!res.ok) throw new Error("Failed to fetch class details");
        const data = await res.json();

        // Filter to COMPLETED or DID_NOT_COMPLETE enrollments
        const exportable = (data.enrollments ?? []).filter(
          (e: EnrollmentPreview) =>
            e.status === "COMPLETED" || e.status === "DID_NOT_COMPLETE"
        );
        setPreview(exportable);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load preview"
        );
      } finally {
        setPreviewLoading(false);
      }
    }
    fetchPreview();
  }, [selectedClassId]);

  async function handleDownload() {
    if (!selectedClassId) return;
    setDownloading(true);
    setError(null);

    try {
      const res = await fetch(`/api/export?classId=${selectedClassId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Export failed");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] ?? "lms-export.csv";

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Red Cross LMS Export</h1>
        <p className="text-muted-foreground">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Red Cross LMS Export</h1>
        <p className="text-muted-foreground mt-1">
          Export class results in Red Cross LMS format for certification
          submission.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Class selector */}
      <div className="space-y-2">
        <label
          htmlFor="class-select"
          className="text-sm font-medium leading-none"
        >
          Select Class
        </label>
        <select
          id="class-select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">-- Select a class --</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.courseType.replace(/_/g, " ")} &mdash; {cls.location}{" "}
              &mdash; {formatDate(cls.startDate)} ({cls.status.replace(/_/g, " ")})
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      {selectedClassId && (
        <div className="space-y-4">
          {previewLoading ? (
            <p className="text-muted-foreground text-sm">Loading preview...</p>
          ) : preview.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No completed or incomplete enrollments found for this class.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {preview.length} student{preview.length !== 1 ? "s" : ""} will
                  be included in the export
                </p>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {downloading ? "Downloading..." : "Download CSV"}
                </button>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Phone
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((e) => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          {e.student.firstName} {e.student.lastName}
                        </td>
                        <td className="px-4 py-2">{e.student.email}</td>
                        <td className="px-4 py-2">
                          {e.student.phone ?? "—"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={
                              e.status === "COMPLETED"
                                ? "text-green-600"
                                : "text-orange-600"
                            }
                          >
                            {e.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
