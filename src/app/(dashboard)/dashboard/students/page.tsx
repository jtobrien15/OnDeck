export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { COURSE_TYPE_LABELS, ENROLLMENT_STATUS_COLORS } from "@/lib/constants";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const students = await db.student.findMany({
    where,
    include: {
      enrollments: {
        include: { class: true },
        orderBy: { registrationDate: "desc" },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <span className="text-sm text-muted-foreground">
          {students.length} student{students.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search by name or email..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </div>
      </form>

      {/* Student Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Active Enrollment
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Class Date
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {search
                    ? `No students found matching "${search}"`
                    : "No students yet. Import students from SGA to get started."}
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const activeEnrollment = student.enrollments.find(
                  (e) =>
                    ![
                      "CANCELLED",
                      "NO_SHOW",
                      "TRANSFERRED",
                      "CERTIFIED",
                    ].includes(e.status)
                );
                const latestEnrollment =
                  activeEnrollment || student.enrollments[0];

                return (
                  <tr key={student.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm">
                        {student.lastName}, {student.firstName}
                      </span>
                      {student.parentName && (
                        <p className="text-xs text-muted-foreground">
                          Parent: {student.parentName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {student.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {latestEnrollment ? (
                        <Link
                          href={`/dashboard/classes/${latestEnrollment.classId}`}
                          className="text-primary hover:underline"
                        >
                          {COURSE_TYPE_LABELS[
                            latestEnrollment.class.courseType
                          ] || latestEnrollment.class.courseType}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {latestEnrollment ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ENROLLMENT_STATUS_COLORS[latestEnrollment.status] || "bg-gray-100 text-gray-700"}`}
                        >
                          {latestEnrollment.status.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {latestEnrollment
                        ? format(
                            new Date(latestEnrollment.class.startDate),
                            "MMM d, yyyy"
                          )
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
