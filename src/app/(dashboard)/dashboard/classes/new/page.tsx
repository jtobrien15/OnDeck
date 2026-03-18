"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COURSE_TYPES = [
  { value: "LIFEGUARDING", label: "Lifeguarding" },
  { value: "CPR_AED_PRO", label: "CPR/AED for Professional Rescuers" },
  { value: "FIRST_AID_CPR_AED", label: "First Aid/CPR/AED" },
  { value: "BLS", label: "Basic Life Support" },
  { value: "LIFEGUARD_INSTRUCTOR", label: "Lifeguarding Instructor" },
  { value: "FA_CPR_AED_INSTRUCTOR", label: "First Aid/CPR/AED Instructor" },
  { value: "BLS_INSTRUCTOR", label: "Basic Life Support Instructor" },
  { value: "BABYSITTER_TRAINING", label: "Babysitter's Training" },
  { value: "WSI", label: "Water Safety Instructor" },
  { value: "LGI_IT_RECERT", label: "LGI/IT Recertification" },
];

const LOCATIONS = [
  { value: "EMILSON", label: "Emilson" },
  { value: "HALE", label: "Hale" },
];

export default function NewClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const body = {
      courseType: form.get("courseType"),
      location: form.get("location"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      scheduleDetails: form.get("scheduleDetails"),
      durationDays: Number(form.get("durationDays")),
      minEnrollment: Number(form.get("minEnrollment")) || 5,
      maxEnrollment: Number(form.get("maxEnrollment")) || 10,
      requiresPrereq: form.get("requiresPrereq") === "on",
      requiresOnline: form.get("requiresOnline") === "on",
      notes: form.get("notes") || undefined,
    };

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create class");
        setLoading(false);
        return;
      }

      const created = await res.json();
      router.push(`/dashboard/classes/${created.id}`);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/classes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Classes
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">New Class</h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Type
            </label>
            <select
              name="courseType"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COURSE_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              name="location"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Schedule Details
          </label>
          <input
            type="text"
            name="scheduleDetails"
            required
            placeholder='e.g., "Fri 5-9pm, Sat-Sun 8am-6pm"'
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              name="durationDays"
              required
              min={1}
              defaultValue={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Min Enrollment
            </label>
            <input
              type="number"
              name="minEnrollment"
              min={1}
              defaultValue={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Enrollment
            </label>
            <input
              type="number"
              name="maxEnrollment"
              min={1}
              defaultValue={10}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="requiresPrereq"
              defaultChecked
              className="rounded border-input"
            />
            Requires Prereq Swim Test
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="requiresOnline"
              defaultChecked
              className="rounded border-input"
            />
            Requires Online Session
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Class"}
          </button>
          <Link
            href="/dashboard/classes"
            className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
