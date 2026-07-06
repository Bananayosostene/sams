import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/app/lib/api-response";
import { createNotification } from "@/app/lib/notification";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;

    if (user.role === "student") {
      where.studentId = user.id;
    }

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, registrationNumber: true } },
        course: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(feedback);
  } catch {
    return errorResponse("Failed to fetch feedback", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "student") return errorResponse("Only students can submit feedback", 403);

    const { courseId, category, message } = await req.json();
    if (!courseId || !category || !message) {
      return errorResponse("Course, category, and message are required");
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId: user.id,
        courseId,
        category,
        message,
        status: "Submitted",
      },
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, name: true, code: true } },
      },
    });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { lecturerIds: true, name: true },
    });

    if (course) {
      for (const lecturerId of course.lecturerIds) {
        createNotification({
          userId: lecturerId,
          title: "New Feedback Submitted",
          message: `${user.name} submitted feedback for ${course.name}`,
          type: "info",
          link: "/lecturer/feedback",
        }).catch(() => {});
      }
    }

    return successResponse(feedback, "Feedback submitted successfully", 201);
  } catch {
    return errorResponse("Failed to submit feedback", 500);
  }
}
