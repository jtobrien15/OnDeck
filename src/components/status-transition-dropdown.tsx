"use client";

import { useState, useRef, useEffect } from "react";

// Must match VALID_TRANSITIONS in lifecycle.ts
const VALID_TRANSITIONS: Record<string, string[]> = {
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
  TRANSFERRED: [],
  WAITLISTED: ["REGISTERED", "CANCELLED"],
  ONLINE_PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["COMPLETED", "DID_NOT_COMPLETE", "NO_SHOW"],
  COMPLETED: ["CERTIFIED"],
  DID_NOT_COMPLETE: [],
  CERTIFIED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const STATUS_LABELS: Record<string, string> = {
  REGISTERED: "Registered",
  PREREQ_SCHEDULED: "Prereq Scheduled",
  PREREQ_PASSED: "Prereq Passed",
  PREREQ_FAILED: "Prereq Failed",
  TRANSFER_PENDING: "Transfer Pending",
  TRANSFERRED: "Transferred",
  WAITLISTED: "Waitlisted",
  ONLINE_PENDING: "Online Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DID_NOT_COMPLETE: "Did Not Complete",
  CERTIFIED: "Certified",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export function StatusTransitionDropdown({
  enrollmentId,
  currentStatus,
  onTransition,
}: {
  enrollmentId: string;
  currentStatus: string;
  onTransition: (
    enrollmentId: string,
    newStatus: string,
    metadata?: Record<string, unknown>
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const validTransitions = VALID_TRANSITIONS[currentStatus] || [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (validTransitions.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">Terminal</span>
    );
  }

  async function handleSelect(newStatus: string) {
    setLoading(true);
    setOpen(false);
    await onTransition(enrollmentId, newStatus);
    setLoading(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Status"}
        <svg
          className="ml-1 h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border bg-popover shadow-md">
          {validTransitions.map((status) => (
            <button
              key={status}
              onClick={() => handleSelect(status)}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-muted first:rounded-t-md last:rounded-b-md"
            >
              {STATUS_LABELS[status] || status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
