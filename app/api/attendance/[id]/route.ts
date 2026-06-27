import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/app/lib/api-response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "lecturer" && user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const { status } = await req.json();

    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Attendance record not found");

    const updated = await prisma.attendance.update({
      where: { id },
      data: { status, recordedById: user.id },
    });
    return successResponse(updated, "Attendance updated successfully");
  } catch {
    return errorResponse("Failed to update attendance", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "lecturer" && user.role !== "admin") return forbiddenResponse();

    const { id } = await params;
    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Attendance record not found");

    await prisma.attendance.delete({ where: { id } });
    return successResponse(null, "Attendance deleted successfully");
  } catch {
    return errorResponse("Failed to delete attendance", 500);
  }
}
