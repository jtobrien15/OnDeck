"use client";

import { useState } from "react";
import { format } from "date-fns";
import { StatusTransitionDropdown } from "./status-transition-dropdown";

interface Enrollment {
  id: string;
  status: string;
  registrationDate: Date | string;
  prereqResult: string;
  prereqScheduledDate: Date | string | null;
  prereqAttempts: number;
  onlineSessionComplete: boolean;
  courseResult: string;
  certificationSubmitted: boolean;
  notes: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  emailLog?: { id: string; templateId: string; sentAt: Date | string }[];
}

const STATUS_COLORS: Record<string, string> = {
  REGISTERED: "bg-blue-100 text-blue-700",
  PREREQ_SCHEDULED: "bg-cyan-100 text-cyan-700",
  PREREQ_PASSED: "bg-green-100 text-green-700",
  PREREQ_FAILED: "bg-red-100 text-red-700",
  TRANSFER_PENDING: "bg-orange-100 text-orange-700",
  TRANSFERRED: "bg-gray-100 text-gray-600",
  WAITLISTED: "bg-yellow-100 text-yellow-700",
  ONLINE_PENDING: "bg-indigo-100 text-indigo-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  DID_NOT_COMPLETE: "bg-red-100 text-red-700",
  CERTIFIED: "bg-green-200 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  NO_SHOW: "bg-red-100 text-red-600",
};

export function EnrollmentTable({
  enrollments,
  classId,
}: {
  enrollments: Enrollment[];
  classId: string;
}) {
  const [rows, setRows] = useState(enrollments);
  const [error, setError] = useState<string | null>(null);

  async function handleTransition(
    enrollmentId: string,
    newStatus: string,
    metadata?: Record<string, unknown>
  ) {
    setError(null);
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus, metadata }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Transition failed");
        return;
      }

      // Refresh — update the row locally
      setRows((prev) =>
        prev.map((r) =>
          r.id === enrollmentId ? { ...r, status: newStatus } : r
        )
      );
    } catch {
      setError("Network error");
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Student
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Prereq
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Online
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Registered
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No enrollments yet.
                </td>
              </tr>
            ) : (
              rows.map((enrollment) => (
                <tr key={enrollment.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">
                      {enrollment.student.firstName}{" "}
                      {enrollment.student.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.student.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[enrollment.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {enrollment.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        enrollment.prereqResult === "PASSED"
                          ? "text-green-600"
                          : enrollment.prereqResult === "FAILED"
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }
                    >
                      {enrollment.prereqResult}
                    </span>
                    {enrollment.prereqScheduledDate && (
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(enrollment.prereqScheduledDate),
                          "MMM d"
                        )}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {enrollment.onlineSessionComplete ? (
                      <span className="text-green-600">Done</span>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(
                      new Date(enrollment.registrationDate),
                      "MMM d, yyyy"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusTransitionDropdown
                      enrollmentId={enrollment.id}
                      currentStatus={enrollment.status}
                      onTransition={handleTransition}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
