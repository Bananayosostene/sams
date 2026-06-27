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
    const { name, email, registrationNumber, facultyId } = await req.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Student not found");

    const student = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(registrationNumber && { registrationNumber }),
        ...(facultyId !== undefined && { facultyId }),
      },
      select: { id: true, name: true, email: true, registrationNumber: true, facultyId: true },
    });
    return successResponse(student, "Student updated successfully");
  } catch {
    return errorResponse("Failed to update student", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Student not found");

    await prisma.feedback.deleteMany({ where: { studentId: id } });
    await prisma.attendance.deleteMany({ where: { studentId: id } });
    await prisma.user.delete({ where: { id } });
    return successResponse(null, "Student deleted successfully");
  } catch {
    return errorResponse("Failed to delete student", 500);
  }
}
