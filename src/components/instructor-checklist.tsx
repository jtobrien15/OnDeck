"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type CourseResultChoice = "PASSED" | "FAILED" | "INCOMPLETE" | null;

interface StudentEnrollment {
  id: string;
  status: string;
  courseResult: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface StudentEntry {
  enrollmentId: string;
  studentName: string;
  email: string;
  result: CourseResultChoice;
  reason: string;
  additionalInfo: string;
}

interface InstructorChecklistProps {
  token: string;
  courseType: string;
  date: string;
  location: string;
  enrollments: StudentEnrollment[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COURSE_TYPE_LABELS: Record<string, string> = {
  LIFEGUARD_CERT: "Lifeguard Certification",
  LIFEGUARD_RECERT: "Lifeguard Recertification",
  WSI: "WSI",
  BLS: "BLS",
  FIRST_AID: "First Aid",
  CPR_AED: "CPR/AED",
};

const LOCATION_LABELS: Record<string, string> = {
  EMILSON: "Emilson",
  HALE: "Hale",
};

function formatCourseType(ct: string): string {
  return COURSE_TYPE_LABELS[ct] || ct;
}

function formatLocation(loc: string): string {
  return LOCATION_LABELS[loc] || loc;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function InstructorChecklist({
  token,
  courseType,
  date,
  location,
  enrollments,
}: InstructorChecklistProps) {
  const [entries, setEntries] = useState<StudentEntry[]>(
    enrollments.map((e) => ({
      enrollmentId: e.id,
      studentName: `${e.student.lastName}, ${e.student.firstName}`,
      email: e.student.email,
      result: null,
      reason: "",
      additionalInfo: "",
    }))
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultErrors, setResultErrors] = useState<Record<string, string>>({});

  function updateEntry(index: number, updates: Partial<StudentEntry>) {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    // Clear any validation errors for this entry
    setResultErrors((prev) => {
      const next = { ...prev };
      delete next[entries[index].enrollmentId];
      return next;
    });
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    let valid = true;

    for (const entry of entries) {
      if (!entry.result) {
        errors[entry.enrollmentId] = "Please select a result";
        valid = false;
      } else if (
        (entry.result === "FAILED" || entry.result === "INCOMPLETE") &&
        !entry.reason.trim()
      ) {
        errors[entry.enrollmentId] = "Reason is required";
        valid = false;
      }
    }

    setResultErrors(errors);
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      const submissions = entries.map((entry) => ({
        enrollmentId: entry.enrollmentId,
        courseResult: entry.result,
        reason: entry.reason.trim() || undefined,
        additionalInfo: entry.additionalInfo.trim() || undefined,
      }));

      const res = await fetch(`/api/instructor/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Check for partial failures
      if (data.results) {
        const failures = data.results.filter(
          (r: { success: boolean; error?: string }) => !r.success
        );
        if (failures.length > 0) {
          const failureErrors: Record<string, string> = {};
          for (const f of failures) {
            failureErrors[f.enrollmentId] = f.error || "Failed to save";
          }
          setResultErrors(failureErrors);
          setError(
            `${failures.length} of ${data.results.length} submissions had errors`
          );
          return;
        }
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Submitted state ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4 text-4xl">&#10003;</div>
              <h2 className="mb-2 text-xl font-semibold text-green-700">
                Results Submitted
              </h2>
              <p className="text-sm text-muted-foreground">
                All {entries.length} student results have been recorded for{" "}
                {formatCourseType(courseType)} on {date}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Checklist form ─────────────────────────────────────────────────────────

  const allSelected = entries.every((e) => e.result !== null);
  const passedCount = entries.filter((e) => e.result === "PASSED").length;
  const totalCount = entries.length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Instructor Checklist
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-700">
            {formatCourseType(courseType)} &mdash; {date}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatLocation(location)} &middot; {totalCount} student
            {totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Student list */}
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <Card
              key={entry.enrollmentId}
              className={cn(
                "transition-colors",
                resultErrors[entry.enrollmentId] && "border-red-300"
              )}
            >
              <CardContent className="pt-4 pb-4">
                {/* Student name */}
                <div className="mb-3">
                  <p className="text-base font-medium text-gray-900">
                    {entry.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.email}</p>
                </div>

                {/* Result toggle buttons */}
                <div className="mb-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateEntry(index, { result: "PASSED", reason: "", additionalInfo: "" })}
                    className={cn(
                      "min-h-[44px] rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      entry.result === "PASSED"
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50"
                    )}
                  >
                    Passed
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEntry(index, { result: "FAILED" })}
                    className={cn(
                      "min-h-[44px] rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      entry.result === "FAILED"
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50"
                    )}
                  >
                    Failed
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEntry(index, { result: "INCOMPLETE" })}
                    className={cn(
                      "min-h-[44px] rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      entry.result === "INCOMPLETE"
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50"
                    )}
                  >
                    Incomplete
                  </button>
                </div>

                {/* Reason + additional info (shown for Failed/Incomplete) */}
                {(entry.result === "FAILED" ||
                  entry.result === "INCOMPLETE") && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Reason <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={entry.reason}
                        onChange={(e) =>
                          updateEntry(index, { reason: e.target.value })
                        }
                        placeholder="Required reason"
                        className="min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Additional Information
                      </label>
                      <Textarea
                        value={entry.additionalInfo}
                        onChange={(e) =>
                          updateEntry(index, {
                            additionalInfo: e.target.value,
                          })
                        }
                        placeholder="Optional additional details"
                        rows={2}
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                {/* Per-entry error */}
                {resultErrors[entry.enrollmentId] && (
                  <p className="mt-2 text-xs text-red-600">
                    {resultErrors[entry.enrollmentId]}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary + Submit */}
        <div className="mt-6 space-y-3">
          {allSelected && (
            <p className="text-center text-sm text-muted-foreground">
              {passedCount} of {totalCount} passed
            </p>
          )}

          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting || !allSelected}
            className="min-h-[48px] w-full text-base font-semibold"
            size="lg"
          >
            {submitting ? "Submitting..." : "Submit All Results"}
          </Button>

          {!allSelected && (
            <p className="text-center text-xs text-muted-foreground">
              Select a result for every student to enable submission
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
