import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "OnDeck <noreply@ondeck.example.com>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  templateId: string;
  enrollmentId?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  templateId,
  enrollmentId,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      await logEmail({
        enrollmentId,
        templateId,
        recipientEmail: to,
        subject,
        status: "failed",
      });
      console.error(`[email] Failed to send ${templateId} to ${to}:`, error);
      return { success: false, error: error.message };
    }

    await logEmail({
      enrollmentId,
      templateId,
      recipientEmail: to,
      subject,
      status: "sent",
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[email] Exception sending ${templateId} to ${to}:`, message);

    try {
      await logEmail({
        enrollmentId,
        templateId,
        recipientEmail: to,
        subject,
        status: "failed",
      });
    } catch (logErr) {
      console.error("[email] Failed to log email error:", logErr);
    }

    return { success: false, error: message };
  }
}

async function logEmail(params: {
  enrollmentId?: string;
  templateId: string;
  recipientEmail: string;
  subject: string;
  status: string;
}) {
  await db.emailLog.create({
    data: {
      enrollmentId: params.enrollmentId ?? null,
      templateId: params.templateId,
      recipientEmail: params.recipientEmail,
      subject: params.subject,
      status: params.status,
    },
  });
}
