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
    const { name, academicYear, startDate, endDate, status } = await req.json();

    const existing = await prisma.semester.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Semester not found");

    const semester = await prisma.semester.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(academicYear && { academicYear }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(status && { status }),
      },
    });
    return successResponse(semester, "Semester updated successfully");
  } catch {
    return errorResponse("Failed to update semester", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const existing = await prisma.semester.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Semester not found");

    const courseCount = await prisma.course.count({ where: { semesterId: id } });
    if (courseCount > 0) {
      return errorResponse("Cannot delete semester with existing courses.", 400);
    }

    await prisma.semester.delete({ where: { id } });
    return successResponse(null, "Semester deleted successfully");
  } catch {
    return errorResponse("Failed to delete semester", 500);
  }
}
