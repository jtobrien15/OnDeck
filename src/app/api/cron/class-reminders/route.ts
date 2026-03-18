import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import ClassReminderEmail from "@/emails/class-reminder";

const LOCATION_LABELS: Record<string, string> = {
  EMILSON: "Emilson YMCA",
  HALE: "Hale YMCA",
};

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
    // Load system settings for reminder threshold
    const settings = await db.systemSettings.findFirst({
      where: { id: "default" },
    });
    const reminderDays = settings?.reminderDaysBefore ?? 3;

    // Calculate the target date (exactly reminderDays from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + reminderDays);

    // Build day boundaries for the target date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find confirmed enrollments where the class starts on the target date
    // and no E7 email has been sent yet
    const enrollments = await db.enrollment.findMany({
      where: {
        status: "CONFIRMED",
        class: {
          startDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        emailLog: {
          none: {
            templateId: "E7",
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
        ClassReminderEmail({
          studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          courseType: enrollment.class.courseType.replace(/_/g, " "),
          startDate: enrollment.class.startDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          scheduleDetails: enrollment.class.scheduleDetails,
          location:
            LOCATION_LABELS[enrollment.class.location] ??
            enrollment.class.location,
        })
      );

      const result = await sendEmail({
        to: enrollment.student.email,
        subject: `Your ${enrollment.class.courseType.replace(/_/g, " ")} class starts in ${reminderDays} days!`,
        html,
        templateId: "E7",
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
    console.error("[cron/class-reminders] Error:", error);
    return NextResponse.json(
      { error: "Failed to process class reminders" },
      { status: 500 }
    );
  }
}
