"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftRight, CheckCircle } from "lucide-react";

interface StudentInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface ClassInfo {
  id: string;
  courseType: string;
  location: string;
  startDate: string;
  endDate: string;
  scheduleDetails: string;
  maxEnrollment: number;
}

interface EnrollmentDetail {
  id: string;
  status: string;
  prereqResult: string;
  prereqAttempts: number;
  student: StudentInfo;
  class: ClassInfo;
}

interface AvailableClass extends ClassInfo {
  availableSpots: number;
  _count: { enrollments: number };
}

export default function TransferDetailPage() {
  const params = useParams<{ enrollmentId: string }>();
  const enrollmentId = params.enrollmentId;

  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>(
    []
  );
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load enrollment details
  useEffect(() => {
    async function fetchEnrollment() {
      try {
        const res = await fetch(`/api/classes`);
        if (!res.ok) throw new Error("Failed to fetch data");

        // We need to find the enrollment — fetch all classes and search
        // Better approach: use the enrollment ID directly
        const enrollmentRes = await fetch(
          `/api/enrollments/${enrollmentId}/transition`,
          { method: "GET" }
        );

        // The transition endpoint is POST only, so let's get the class data
        // and find the enrollment within it
        const classesData = await res.json();

        // Search through classes to find the enrollment
        for (const cls of classesData) {
          const classRes = await fetch(`/api/classes/${cls.id}`);
          if (!classRes.ok) continue;
          const classData = await classRes.json();

          const found = classData.enrollments?.find(
            (e: { id: string }) => e.id === enrollmentId
          );
          if (found) {
            setEnrollment({
              ...found,
              class: classData,
            });
            // Fetch available destination classes
            const availRes = await fetch(
              `/api/classes/available?courseType=${classData.courseType}&excludeClassId=${classData.id}`
            );
            if (availRes.ok) {
              const availData = await availRes.json();
              setAvailableClasses(availData);
            }
            break;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollment();
  }, [enrollmentId]);

  async function handleTransfer() {
    if (!selectedClassId || !enrollment) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/enrollments/${enrollmentId}/transition`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newStatus: "TRANSFERRED",
            metadata: {
              destinationClassId: selectedClassId,
            },
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Transfer failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl font-bold">Transfer Student</h1>
        <p className="text-muted-foreground">Loading enrollment details...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Transfer Student</h1>
        <p className="text-destructive">
          Enrollment not found or is not in a transferable state.
        </p>
        <Link
          href="/dashboard/transfers"
          className="text-sm text-primary hover:underline"
        >
          Back to transfers
        </Link>
      </div>
    );
  }

  if (success) {
    const destClass = availableClasses.find((c) => c.id === selectedClassId);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Transfer Complete</h1>
        <div className="rounded-md border border-green-200 bg-green-50 p-6 space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">Transfer successful</p>
          </div>
          <p className="text-sm text-green-700">
            {enrollment.student.firstName} {enrollment.student.lastName} has been
            transferred to{" "}
            {destClass
              ? `${destClass.courseType.replace(/_/g, " ")} at ${destClass.location} (${formatDate(destClass.startDate)})`
              : "the new class"}
            .
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/transfers"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Back to Transfers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/transfers"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to transfers
        </Link>
        <h1 className="text-2xl font-bold mt-2">Transfer Student</h1>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Current enrollment info */}
      <div className="rounded-md border p-4 space-y-2">
        <h2 className="font-medium">Current Enrollment</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Student:</span>{" "}
            {enrollment.student.firstName} {enrollment.student.lastName}
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            {enrollment.student.email}
          </div>
          <div>
            <span className="text-muted-foreground">Class:</span>{" "}
            {enrollment.class.courseType.replace(/_/g, " ")}
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>{" "}
            {enrollment.class.location}
          </div>
          <div>
            <span className="text-muted-foreground">Dates:</span>{" "}
            {formatDate(enrollment.class.startDate)} &mdash;{" "}
            {formatDate(enrollment.class.endDate)}
          </div>
          <div>
            <span className="text-muted-foreground">Prereq Status:</span>{" "}
            <span
              className={
                enrollment.prereqResult === "FAILED"
                  ? "text-red-600"
                  : enrollment.prereqResult === "PASSED"
                    ? "text-green-600"
                    : ""
              }
            >
              {enrollment.prereqResult}
            </span>{" "}
            ({enrollment.prereqAttempts} attempt
            {enrollment.prereqAttempts !== 1 ? "s" : ""})
          </div>
        </div>
      </div>

      {/* Available destination classes */}
      <div className="space-y-3">
        <h2 className="font-medium">
          Select Destination Class
          {availableClasses.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {availableClasses.length} available
            </span>
          )}
        </h2>

        {availableClasses.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center">
            <p className="text-muted-foreground">
              No available classes of the same course type with open spots.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {availableClasses.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`text-left rounded-md border p-4 transition-colors ${
                  selectedClassId === cls.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {cls.courseType.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(cls.startDate)} &mdash;{" "}
                      {formatDate(cls.endDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cls.location} &mdash; {cls.scheduleDetails}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {cls.availableSpots} spot
                      {cls.availableSpots !== 1 ? "s" : ""} available
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirm button */}
      {selectedClassId && (
        <div className="flex justify-end">
          <button
            onClick={handleTransfer}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <ArrowLeftRight className="h-4 w-4" />
            {submitting ? "Transferring..." : "Confirm Transfer"}
          </button>
        </div>
      )}
    </div>
  );
}
