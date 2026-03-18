import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const classData = await db.class.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { student: true },
        },
        waitlist: true,
        instructorAssignments: {
          include: { instructor: true },
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error("Failed to get class:", error);
    return NextResponse.json(
      { error: "Failed to get class" },
      { status: 500 }
    );
  }
}
