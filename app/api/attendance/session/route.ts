import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "lecturer" && user.role !== "admin") return forbiddenResponse();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const where: Record<string, unknown> = { lecturerId: user.id };
    if (courseId) where.courseId = courseId;

    const sessions = await prisma.attendanceSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const result = [];
    for (const session of sessions) {
      const submissions = await prisma.attendance.count({
        where: {
          courseId: session.courseId,
          date: session.date,
          recordedById: session.lecturerId,
          source: "student",
        },
      });
      const expired = !!session.expiresAt && session.expiresAt.getTime() <= Date.now();
      result.push({ ...session, submissions, expired });
    }

    return successResponse(result);
  } catch {
    return errorResponse("Failed to fetch attendance sessions", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "lecturer" && user.role !== "admin") return forbiddenResponse();

    const { courseId, date, expiresAt } = await req.json();
    if (!courseId || !date) return errorResponse("courseId and date are required");

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse("Course not found", 404);
    if (user.role !== "admin" && !course.lecturerIds.includes(user.id)) {
      return forbiddenResponse("You are not assigned to this course");
    }

    let deadline: Date | null = null;
    if (expiresAt) {
      const parsed = new Date(expiresAt);
      if (isNaN(parsed.getTime())) return errorResponse("Invalid expiry time");
      deadline = parsed;
    }

    const now = new Date();
    const existing = await prisma.attendanceSession.findFirst({
      where: {
        courseId,
        lecturerId: user.id,
        date,
        status: "active",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    let session = existing;
    if (session) {
      if (deadline && deadline.getTime() !== session.expiresAt?.getTime()) {
        session = await prisma.attendanceSession.update({
          where: { id: session.id },
          data: { expiresAt: deadline },
        });
      }
    } else {
      const crypto = await import("node:crypto");
      const token = crypto.randomBytes(24).toString("hex");
      session = await prisma.attendanceSession.create({
        data: {
          courseId,
          lecturerId: user.id,
          date,
          token,
          status: "active",
          expiresAt: deadline,
        },
      });
    }

    const origin = new URL(req.url).origin;
    return successResponse({
      session,
      link: `${origin}/student/self/${session.token}`,
    }, "Attendance link generated successfully", 201);
  } catch {
    return errorResponse("Failed to generate attendance link", 500);
  }
}