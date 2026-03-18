"use client";

import { useState } from "react";

const EMAIL_TEMPLATES = [
  {
    id: "E1",
    name: "Registration Confirmation",
    trigger: "Sent when a student is registered for a class",
    description: "Welcomes the student, provides class details, prereq info, and online session reminder.",
  },
  {
    id: "E2",
    name: "Prereq Reminder / Nudge",
    trigger: "Sent automatically 7 days after registration if prereq not scheduled (cron)",
    description: "Reminds the student to schedule their prerequisite swim test before the deadline.",
  },
  {
    id: "E3",
    name: "Prereq Failed",
    trigger: "Sent when enrollment transitions to PREREQ_FAILED",
    description: "Notifies student their prereq was not passed. Shows retry option or transfer info.",
  },
  {
    id: "E4",
    name: "Transfer Options",
    trigger: "Sent when enrollment transitions to TRANSFER_PENDING",
    description: "Presents available classes the student can transfer to.",
  },
  {
    id: "E7",
    name: "Class Reminder (3 Days)",
    trigger: "Sent automatically 3 days before class starts (cron)",
    description: "Reminds confirmed students about their upcoming class. Includes checklist items.",
  },
];

export default function EmailsPage() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function loadPreview(templateId: string) {
    setLoading(true);
    setPreviewId(templateId);
    try {
      const res = await fetch(`/api/email/preview?templateId=${templateId}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
      } else {
        setPreviewHtml("<p>Failed to load preview</p>");
      }
    } catch {
      setPreviewHtml("<p>Failed to load preview</p>");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <div className="space-y-3">
          {EMAIL_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                previewId === template.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/30"
              }`}
              onClick={() => loadPreview(template.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {template.id}
                </span>
                <h3 className="font-medium text-sm">{template.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {template.trigger}
              </p>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
          ))}
        </div>

        {/* Preview Panel */}
        <div className="rounded-lg border">
          {previewId ? (
            <div>
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  Preview: {EMAIL_TEMPLATES.find((t) => t.id === previewId)?.name}
                </h3>
              </div>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading preview...
                </div>
              ) : (
                <div className="p-4">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border rounded"
                    title="Email Preview"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Click a template to preview it
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
