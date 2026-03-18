/**
 * Enrollment lifecycle state machine.
 * ALL status transitions MUST go through transitionEnrollment().
 * Never update enrollment status directly in API routes.
 */

import { EnrollmentStatus, PrereqResult } from "@prisma/client";
import { db } from "./db";
import type { TransitionMetadata } from "@/types";
import {
  sendWelcomeEmail,
  sendPrereqFailedEmail,
  sendTransferOptionsEmail,
} from "@/lib/email-triggers";

// ─── VALID TRANSITIONS ────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  REGISTERED: [
    "PREREQ_SCHEDULED",
    "WAITLISTED",
    "ONLINE_PENDING",
    "CONFIRMED",
    "CANCELLED",
  ],
  PREREQ_SCHEDULED: ["PREREQ_PASSED", "PREREQ_FAILED", "CANCELLED"],
  PREREQ_PASSED: ["ONLINE_PENDING", "CONFIRMED", "CANCELLED"],
  PREREQ_FAILED: ["PREREQ_SCHEDULED", "TRANSFER_PENDING", "CANCELLED"],
  TRANSFER_PENDING: ["TRANSFERRED", "CANCELLED"],
  TRANSFERRED: [], // Terminal for original enrollment
  WAITLISTED: ["REGISTERED", "CANCELLED"],
  ONLINE_PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["COMPLETED", "DID_NOT_COMPLETE", "NO_SHOW"],
  COMPLETED: ["CERTIFIED"],
  DID_NOT_COMPLETE: [], // Terminal
  CERTIFIED: [], // Terminal
  CANCELLED: [], // Terminal
  NO_SHOW: [], // Terminal
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function isValidTransition(
  currentStatus: EnrollmentStatus,
  newStatus: EnrollmentStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

export function getValidTransitions(
  currentStatus: EnrollmentStatus
): EnrollmentStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

// ─── MAIN TRANSITION FUNCTION ─────────────────────────────────────────────────

export async function transitionEnrollment(
  enrollmentId: string,
  newStatus: EnrollmentStatus,
  metadata?: TransitionMetadata
): Promise<{ success: boolean; error?: string }> {
  // Load enrollment with relations
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: true,
      class: true,
    },
  });

  if (!enrollment) {
    return { success: false, error: "Enrollment not found" };
  }

  // Validate transition
  if (!isValidTransition(enrollment.status, newStatus)) {
    return {
      success: false,
      error: `Invalid transition: ${enrollment.status} → ${newStatus}`,
    };
  }

  // Build update payload
  const updateData: Record<string, unknown> = { status: newStatus };

  // ─── PER-TRANSITION SIDE EFFECTS ──────────────────────────────────────────

  switch (newStatus) {
    case "REGISTERED": {
      // E.g., promoted from waitlist — send welcome email
      sendWelcomeEmail(enrollment, enrollment.student, enrollment.class)
        .catch((err) => console.error("[lifecycle] E1 email failed:", err));
      break;
    }

    case "PREREQ_SCHEDULED": {
      if (metadata?.prereqScheduledDate) {
        updateData.prereqScheduledDate = metadata.prereqScheduledDate;
      }
      break;
    }

    case "PREREQ_PASSED": {
      updateData.prereqResult = PrereqResult.PASSED;
      updateData.prereqCompletedDate = new Date();
      updateData.prereqAttempts = { increment: 1 };

      // Auto-advance: if online session done → CONFIRMED, else ONLINE_PENDING
      const nextStatus = enrollment.onlineSessionComplete
        ? "CONFIRMED"
        : "ONLINE_PENDING";

      // We apply PREREQ_PASSED first, then schedule auto-advance
      // (caller can chain or we do it inline)
      await db.enrollment.update({
        where: { id: enrollmentId },
        data: updateData,
      });

      // Auto-advance to next status
      return transitionEnrollment(enrollmentId, nextStatus, metadata);
    }

    case "PREREQ_FAILED": {
      updateData.prereqResult = PrereqResult.FAILED;
      updateData.prereqAttempts = { increment: 1 };

      // Check if waitlist exists for this class
      const waitlistCount = await db.waitlistEntry.count({
        where: { classId: enrollment.classId },
      });

      await db.enrollment.update({
        where: { id: enrollmentId },
        data: updateData,
      });

      if (waitlistCount > 0) {
        // Must transfer — send E3 (canRetry=false), then auto-advance
        sendPrereqFailedEmail(enrollment, enrollment.student, enrollment.class, false)
          .catch((err) => console.error("[lifecycle] E3 email failed:", err));
        return transitionEnrollment(enrollmentId, "TRANSFER_PENDING", metadata);
      }

      // No waitlist — stay PREREQ_FAILED, Mary Beth can reschedule
      sendPrereqFailedEmail(enrollment, enrollment.student, enrollment.class, true)
        .catch((err) => console.error("[lifecycle] E3 email failed:", err));
      return { success: true };
    }

    case "TRANSFER_PENDING": {
      sendTransferOptionsEmail(enrollment, enrollment.student, enrollment.class)
        .catch((err) => console.error("[lifecycle] E4 email failed:", err));
      break;
    }

    case "TRANSFERRED": {
      if (!metadata?.destinationClassId) {
        return {
          success: false,
          error: "destinationClassId required for TRANSFERRED transition",
        };
      }

      await db.enrollment.update({
        where: { id: enrollmentId },
        data: { status: "TRANSFERRED" },
      });

      // Create new enrollment in destination class
      const newEnrollment = await db.enrollment.create({
        data: {
          studentId: enrollment.studentId,
          classId: metadata.destinationClassId,
          status: "REGISTERED",
          transferredFromClassId: enrollment.classId,
        },
        include: { class: true },
      });

      // Trigger waitlist check on original class
      await triggerWaitlistPromotion(enrollment.classId);

      // Send E1 welcome email for the new enrollment
      sendWelcomeEmail(newEnrollment, enrollment.student, newEnrollment.class)
        .catch((err) => console.error("[lifecycle] E1 email (transfer) failed:", err));
      return { success: true };
    }

    case "WAITLISTED": {
      // Get next position number
      const lastEntry = await db.waitlistEntry.findFirst({
        where: { classId: enrollment.classId },
        orderBy: { position: "desc" },
      });

      await db.waitlistEntry.create({
        data: {
          classId: enrollment.classId,
          studentId: enrollment.studentId,
          position: (lastEntry?.position ?? 0) + 1,
        },
      });
      break;
    }

    case "CONFIRMED": {
      // E7 reminder sent by cron 3 days before class — no immediate email
      break;
    }

    case "COMPLETED": {
      updateData.courseResult = "PASSED";
      break;
    }

    case "DID_NOT_COMPLETE": {
      if (metadata?.courseResult) updateData.courseResult = metadata.courseResult;
      if (metadata?.courseResultReason)
        updateData.courseResultReason = metadata.courseResultReason;
      if (metadata?.additionalInfo)
        updateData.additionalInfo = metadata.additionalInfo;
      break;
    }

    case "CERTIFIED": {
      updateData.certificationSubmitted = true;
      updateData.certificationSubmittedDate = new Date();
      // TODO: send E11
      break;
    }

    case "CANCELLED":
    case "NO_SHOW": {
      // Release spot → trigger waitlist promotion
      await db.enrollment.update({
        where: { id: enrollmentId },
        data: { status: newStatus },
      });

      await triggerWaitlistPromotion(enrollment.classId);
      return { success: true };
    }
  }

  // Apply update
  await db.enrollment.update({
    where: { id: enrollmentId },
    data: updateData,
  });

  return { success: true };
}

// ─── WAITLIST PROMOTION ───────────────────────────────────────────────────────

/**
 * When a spot opens, notify the first eligible (prereq-passed) waitlist student.
 * Only one student is notified at a time.
 */
export async function triggerWaitlistPromotion(classId: string): Promise<void> {
  const waitlistEntries = await db.waitlistEntry.findMany({
    where: { classId, notified: false },
    orderBy: { position: "asc" },
    include: { student: true },
  });

  for (const entry of waitlistEntries) {
    if (entry.prereqStatus === PrereqResult.PASSED) {
      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 48);

      await db.waitlistEntry.update({
        where: { id: entry.id },
        data: {
          notified: true,
          notifiedDate: new Date(),
          responseDeadline,
        },
      });

      // TODO: send E8 (spot available) to entry.student
      break; // Only notify one at a time
    }
    // Skip students who haven't passed prereq
  }
}

/**
 * Called by cron to check for expired waitlist response deadlines.
 * Promotes the next eligible student when a deadline has passed.
 */
export async function processExpiredWaitlistDeadlines(): Promise<void> {
  const now = new Date();

  const expiredEntries = await db.waitlistEntry.findMany({
    where: {
      notified: true,
      responseDeadline: { lt: now },
    },
    include: { class: true },
  });

  const classIds = [...new Set(expiredEntries.map((e) => e.classId))];

  for (const classId of classIds) {
    // Remove expired notified entries
    await db.waitlistEntry.deleteMany({
      where: {
        classId,
        notified: true,
        responseDeadline: { lt: now },
      },
    });

    // Trigger next promotion
    await triggerWaitlistPromotion(classId);
  }
}
