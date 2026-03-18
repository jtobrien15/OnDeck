import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

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
        },
      },
      orderBy: { lastName: "asc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Failed to list students:", error);
    return NextResponse.json(
      { error: "Failed to list students" },
      { status: 500 }
    );
  }
}
