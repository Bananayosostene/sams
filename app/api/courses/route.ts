import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lecturerId = searchParams.get("lecturerId");
    const facultyId = searchParams.get("facultyId");

    const where: Record<string, unknown> = {};
    if (lecturerId) where.lecturerIds = { has: lecturerId };
    if (facultyId) where.facultyId = facultyId;

    const courses = await prisma.course.findMany({
      where,
      include: {
        faculty: true,
        semester: true,
        _count: { select: { attendance: true, feedbacks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(courses);
  } catch {
    return errorResponse("Failed to fetch courses", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { name, code, facultyId, credits, semesterId } = await req.json();
    if (!name || !code || !facultyId || !credits || !semesterId) {
      return errorResponse("All fields are required");
    }

    const existing = await prisma.course.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return errorResponse("Course code already exists", 409);

    const course = await prisma.course.create({
      data: {
        name,
        code: code.toUpperCase(),
        facultyId,
        credits: parseInt(credits),
        semesterId,
        lecturerIds: [],
      },
      include: { faculty: true, semester: true },
    });
    return successResponse(course, "Course created successfully", 201);
  } catch {
    return errorResponse("Failed to create course", 500);
  }
}
