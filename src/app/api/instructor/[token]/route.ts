import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transitionEnrollment } from "@/lib/lifecycle";
import type { CourseResult } from "@prisma/client";

export const dynamic = "force-dynamic";

// ─── GET: Return class with enrollments for client-side refresh ──────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const classData = await db.class.findUnique({
    where: { instructorToken: token },
    include: {
      enrollments: {
        where: {
          status: { in: ["IN_PROGRESS", "CONFIRMED"] },
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { student: { lastName: "asc" } },
          { student: { firstName: "asc" } },
        ],
      },
    },
  });

  if (!classData) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  return NextResponse.json({ class: classData });
}

// ─── POST: Submit instructor results for enrollments ─────────────────────────

interface SubmissionItem {
  enrollmentId: string;
  courseResult: CourseResult;
  reason?: string;
  additionalInfo?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Verify the token belongs to a real class
  const classData = await db.class.findUnique({
    where: { instructorToken: token },
    select: { id: true },
  });

  if (!classData) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  let submissions: SubmissionItem[];
  try {
    const body = await request.json();
    submissions = body.submissions;
    if (!Array.isArray(submissions) || submissions.length === 0) {
      return NextResponse.json(
        { error: "submissions array is required" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Verify all enrollments belong to this class
  const enrollmentIds = submissions.map((s) => s.enrollmentId);
  const enrollments = await db.enrollment.findMany({
    where: {
      id: { in: enrollmentIds },
      classId: classData.id,
    },
    select: { id: true },
  });

  const validIds = new Set(enrollments.map((e) => e.id));
  const invalidIds = enrollmentIds.filter((id) => !validIds.has(id));
  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: `Enrollments not found for this class: ${invalidIds.join(", ")}` },
      { status: 400 }
    );
  }

  // Process each submission
  const results: { enrollmentId: string; success: boolean; error?: string }[] = [];

  for (const submission of submissions) {
    const { enrollmentId, courseResult, reason, additionalInfo } = submission;

    // Validate required reason for non-passed results
    if (
      (courseResult === "FAILED" || courseResult === "INCOMPLETE") &&
      !reason
    ) {
      results.push({
        enrollmentId,
        success: false,
        error: "Reason is required for Failed or Incomplete results",
      });
      continue;
    }

    if (courseResult === "PASSED") {
      // Transition to COMPLETED (lifecycle sets courseResult to PASSED)
      const result = await transitionEnrollment(enrollmentId, "COMPLETED");
      results.push({ enrollmentId, ...result });
    } else if (
      courseResult === "FAILED" ||
      courseResult === "INCOMPLETE"
    ) {
      // Transition to DID_NOT_COMPLETE with metadata
      const result = await transitionEnrollment(
        enrollmentId,
        "DID_NOT_COMPLETE",
        {
          courseResult,
          courseResultReason: reason,
          additionalInfo: additionalInfo || undefined,
        }
      );
      results.push({ enrollmentId, ...result });
    } else {
      results.push({
        enrollmentId,
        success: false,
        error: `Invalid courseResult: ${courseResult}`,
      });
    }
  }

  const allSuccess = results.every((r) => r.success);
  return NextResponse.json(
    { success: allSuccess, results },
    { status: allSuccess ? 200 : 207 }
  );
}
