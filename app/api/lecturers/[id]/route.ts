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
    const { name, email, facultyId, assignedCourses } = await req.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Lecturer not found");

    if (assignedCourses !== undefined) {
      for (const courseId of existing.assignedCourses) {
        await prisma.course.update({
          where: { id: courseId },
          data: { lecturerIds: { set: (await prisma.course.findUnique({ where: { id: courseId } }))?.lecturerIds.filter((l: string) => l !== id) || [] } },
        });
      }
      for (const courseId of assignedCourses) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course && !course.lecturerIds.includes(id)) {
          await prisma.course.update({
            where: { id: courseId },
            data: { lecturerIds: { push: id } },
          });
        }
      }
    }

    const lecturer = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(facultyId !== undefined && { facultyId }),
        ...(assignedCourses !== undefined && { assignedCourses }),
      },
      select: { id: true, name: true, email: true, facultyId: true, assignedCourses: true },
    });
    return successResponse(lecturer, "Lecturer updated successfully");
  } catch {
    return errorResponse("Failed to update lecturer", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Lecturer not found");

    for (const courseId of existing.assignedCourses) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        await prisma.course.update({
          where: { id: courseId },
          data: { lecturerIds: course.lecturerIds.filter((l: string) => l !== id) },
        });
      }
    }

    await prisma.user.delete({ where: { id } });
    return successResponse(null, "Lecturer deleted successfully");
  } catch {
    return errorResponse("Failed to delete lecturer", 500);
  }
}
