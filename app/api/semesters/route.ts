import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    const semesters = await prisma.semester.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(semesters);
  } catch {
    return errorResponse("Failed to fetch semesters", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { name, academicYear, startDate, endDate } = await req.json();
    if (!name || !academicYear) return errorResponse("Name and academic year are required");

    const semester = await prisma.semester.create({
      data: { name, academicYear, startDate, endDate, status: "Upcoming" },
    });
    return successResponse(semester, "Semester created successfully", 201);
  } catch {
    return errorResponse("Failed to create semester", 500);
  }
}
