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
    const { name, code } = await req.json();

    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Faculty not found");

    if (code && code.toUpperCase() !== existing.code) {
      const dup = await prisma.faculty.findUnique({ where: { code: code.toUpperCase() } });
      if (dup) return errorResponse("Faculty code already exists", 409);
    }

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
      },
    });
    return successResponse(faculty, "Faculty updated successfully");
  } catch {
    return errorResponse("Failed to update faculty", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Faculty not found");

    const courseCount = await prisma.course.count({ where: { facultyId: id } });
    if (courseCount > 0) {
      return errorResponse("Cannot delete faculty with existing courses. Remove courses first.", 400);
    }

    await prisma.faculty.delete({ where: { id } });
    return successResponse(null, "Faculty deleted successfully");
  } catch {
    return errorResponse("Failed to delete faculty", 500);
  }
}
