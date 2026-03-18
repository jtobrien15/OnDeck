import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const courseType = request.nextUrl.searchParams.get("courseType");
    const excludeClassId = request.nextUrl.searchParams.get("excludeClassId");

    if (!courseType) {
      return NextResponse.json(
        { error: "courseType query parameter is required" },
        { status: 400 }
      );
    }

    const classes = await db.class.findMany({
      where: {
        courseType: courseType as never,
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        ...(excludeClassId ? { id: { not: excludeClassId } } : {}),
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    // Filter to classes with available capacity
    const available = classes
      .filter((cls) => cls._count.enrollments < cls.maxEnrollment)
      .map((cls) => ({
        ...cls,
        availableSpots: cls.maxEnrollment - cls._count.enrollments,
      }));

    return NextResponse.json(available);
  } catch (error) {
    console.error("Failed to fetch available classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch available classes" },
      { status: 500 }
    );
  }
}
