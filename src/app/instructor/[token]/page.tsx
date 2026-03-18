import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { InstructorChecklist } from "@/components/instructor-checklist";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function InstructorChecklistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const classData = await db.class.findUnique({
    where: { instructorToken: token },
    include: {
      enrollments: {
        where: {
          status: { in: ["IN_PROGRESS", "CONFIRMED"] },
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { student: { lastName: "asc" } },
          { student: { firstName: "asc" } },
        ],
      },
    },
  });

  if (!classData) {
    notFound();
  }

  const formattedDate = format(new Date(classData.startDate), "MMM d, yyyy");

  return (
    <main>
      <InstructorChecklist
        token={token}
        courseType={classData.courseType}
        date={formattedDate}
        location={classData.location}
        enrollments={classData.enrollments.map((e) => ({
          id: e.id,
          status: e.status,
          courseResult: e.courseResult,
          student: e.student,
        }))}
      />
    </main>
  );
}
