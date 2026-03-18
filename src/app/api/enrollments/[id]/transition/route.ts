import { NextRequest, NextResponse } from "next/server";
import { EnrollmentStatus } from "@prisma/client";
import { transitionEnrollment } from "@/lib/lifecycle";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newStatus, metadata } = body;

    if (!newStatus) {
      return NextResponse.json(
        { error: "newStatus is required" },
        { status: 400 }
      );
    }

    // Validate that newStatus is a valid EnrollmentStatus
    const validStatuses = Object.values(EnrollmentStatus);
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status: ${newStatus}` },
        { status: 400 }
      );
    }

    const result = await transitionEnrollment(id, newStatus, metadata);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return the updated enrollment
    const updatedEnrollment = await db.enrollment.findUnique({
      where: { id },
      include: {
        student: true,
        class: true,
      },
    });

    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    console.error("Failed to transition enrollment:", error);
    return NextResponse.json(
      { error: "Failed to transition enrollment" },
      { status: 500 }
    );
  }
}
