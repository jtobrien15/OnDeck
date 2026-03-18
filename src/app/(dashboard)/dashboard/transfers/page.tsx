import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const enrollments = await db.enrollment.findMany({
    where: { status: "TRANSFER_PENDING" },
    include: {
      student: true,
      class: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Transfers</h1>
        <p className="text-muted-foreground mt-1">
          Students awaiting transfer to a new class after prereq failure.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No pending transfers at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/dashboard/transfers/${enrollment.id}`}
              className="block rounded-md border p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {enrollment.student.firstName}{" "}
                    {enrollment.student.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.class.courseType.replace(/_/g, " ")} &mdash;{" "}
                    {enrollment.class.location} &mdash;{" "}
                    {enrollment.class.startDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    {enrollment.prereqResult === "FAILED"
                      ? "Prereq Failed"
                      : "Transfer Pending"}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {enrollment.prereqAttempts} prereq attempt
                    {enrollment.prereqAttempts !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
