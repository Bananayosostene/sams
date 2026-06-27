import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/app/lib/api-response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "student") return forbiddenResponse();

    const { id } = await params;
    const { message } = await req.json();

    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Feedback not found");
    if (existing.studentId !== user.id) return forbiddenResponse();

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { message },
    });
    return successResponse(feedback, "Feedback updated successfully");
  } catch {
    return errorResponse("Failed to update feedback", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Feedback not found");
    if (existing.studentId !== user.id && user.role !== "admin") return forbiddenResponse();

    await prisma.feedback.delete({ where: { id } });
    return successResponse(null, "Feedback deleted successfully");
  } catch {
    return errorResponse("Failed to delete feedback", 500);
  }
}
