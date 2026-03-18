import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import WelcomeEmail from "@/emails/welcome";
import PrereqReminderEmail from "@/emails/prereq-reminder";
import PrereqFailedEmail from "@/emails/prereq-failed";
import TransferOptionsEmail from "@/emails/transfer-options";
import ClassReminderEmail from "@/emails/class-reminder";

const SAMPLE_DATA = {
  E1: () =>
    WelcomeEmail({
      studentName: "Jane Smith",
      courseType: "Lifeguarding",
      startDate: "Fri, Apr 18, 2026",
      endDate: "Sun, Apr 20, 2026",
      scheduleDetails: "Fri 5-9pm, Sat-Sun 8am-6pm",
      location: "Emilson",
    }),
  E2: () =>
    PrereqReminderEmail({
      studentName: "Jane Smith",
      courseType: "Lifeguarding",
      startDate: "Fri, Apr 18, 2026",
      prereqDeadline: "Tue, Apr 15, 2026",
    }),
  E3: () =>
    PrereqFailedEmail({
      studentName: "Jane Smith",
      courseType: "Lifeguarding",
      canRetry: true,
      transferInfo: undefined,
    }),
  E4: () =>
    TransferOptionsEmail({
      studentName: "Jane Smith",
      originalCourseType: "Lifeguarding",
      availableClasses: [
        {
          id: "sample-1",
          startDate: "Fri, May 2, 2026",
          location: "Emilson",
          scheduleDetails: "Fri 5-9pm, Sat-Sun 8am-6pm",
        },
        {
          id: "sample-2",
          startDate: "Fri, May 16, 2026",
          location: "Hale",
          scheduleDetails: "Sat-Sun 8am-5pm, Mon 8am-2pm",
        },
      ],
    }),
  E7: () =>
    ClassReminderEmail({
      studentName: "Jane Smith",
      courseType: "Lifeguarding",
      startDate: "Fri, Apr 18, 2026",
      scheduleDetails: "Fri 5-9pm, Sat-Sun 8am-6pm",
      location: "Emilson",
    }),
};

export async function GET(request: NextRequest) {
  const templateId = request.nextUrl.searchParams.get("templateId");

  if (!templateId || !(templateId in SAMPLE_DATA)) {
    return NextResponse.json(
      { error: `Unknown template: ${templateId}` },
      { status: 400 }
    );
  }

  try {
    const component = SAMPLE_DATA[templateId as keyof typeof SAMPLE_DATA]();
    const html = await render(component);
    return NextResponse.json({ html });
  } catch (error) {
    console.error("Failed to render email preview:", error);
    return NextResponse.json(
      { error: "Failed to render preview" },
      { status: 500 }
    );
  }
}
