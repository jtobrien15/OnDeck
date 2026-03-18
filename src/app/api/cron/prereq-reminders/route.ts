import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import PrereqReminderEmail from "@/emails/prereq-reminder";

function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // Skip auth for local dev
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Load system settings for nudge threshold
    const settings = await db.systemSettings.findFirst({
      where: { id: "default" },
    });
    const nudgeDays = settings?.nudgeDaysAfterReg ?? 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - nudgeDays);

    // Find enrollments that need a prereq reminder (E2):
    // - Status is REGISTERED
    // - Class requires a prereq
    // - Registered more than nudgeDays ago
    // - No prereq scheduled yet
    // - No E2 email sent yet
    const enrollments = await db.enrollment.findMany({
      where: {
        status: "REGISTERED",
        prereqScheduledDate: null,
        registrationDate: { lt: cutoffDate },
        class: {
          requiresPrereq: true,
        },
        emailLog: {
          none: {
            templateId: "E2",
          },
        },
      },
      include: {
        student: true,
        class: true,
      },
    });

    let sentCount = 0;

    for (const enrollment of enrollments) {
      const html = await render(
        PrereqReminderEmail({
          studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          courseType: enrollment.class.courseType.replace(/_/g, " "),
          startDate: enrollment.class.startDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          prereqDeadline: enrollment.class.prereqDeadline
            ? enrollment.class.prereqDeadline.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "TBD",
        })
      );

      const result = await sendEmail({
        to: enrollment.student.email,
        subject: `Reminder: Schedule your prerequisite swim test for ${enrollment.class.courseType.replace(/_/g, " ")}`,
        html,
        templateId: "E2",
        enrollmentId: enrollment.id,
      });

      if (result.success) {
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: sentCount,
      totalEligible: enrollments.length,
    });
  } catch (error) {
    console.error("[cron/prereq-reminders] Error:", error);
    return NextResponse.json(
      { error: "Failed to process prereq reminders" },
      { status: 500 }
    );
  }
}
