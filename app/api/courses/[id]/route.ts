import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/app/lib/api-response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const { name, code, facultyId, credits, semesterId, lecturerIds } = await req.json();

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Course not found");

    if (code && code.toUpperCase() !== existing.code) {
      const dup = await prisma.course.findUnique({ where: { code: code.toUpperCase() } });
      if (dup) return errorResponse("Course code already exists", 409);
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
        ...(facultyId && { facultyId }),
        ...(credits && { credits: parseInt(credits) }),
        ...(semesterId && { semesterId }),
        ...(lecturerIds !== undefined && { lecturerIds }),
      },
      include: { faculty: true, semester: true },
    });
    return successResponse(course, "Course updated successfully");
  } catch {
    return errorResponse("Failed to update course", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Course not found");

    await prisma.feedback.deleteMany({ where: { courseId: id } });
    await prisma.attendance.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });

    return successResponse(null, "Course deleted successfully");
  } catch {
    return errorResponse("Failed to delete course", 500);
  }
}
