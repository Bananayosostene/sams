import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/app/lib/api-response";

function dayString(d: Date): string {
  return d.toISOString().split("T")[0];
}

function isEnrolled(user: { facultyId: string | null; assignedCourses: string[] }, course: { facultyId: string; id: string }) {
  return user.facultyId === course.facultyId || user.assignedCourses.includes(course.id);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "student") return forbiddenResponse();

    const { token } = await params;
    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      include: { course: { select: { id: true, name: true, code: true, facultyId: true, latitude: true, longitude: true } } },
    });
    if (!session) return notFoundResponse("Attendance session not found");

    const today = dayString(new Date());

    // Resolve the correct link the lecturer is using today for this course.
    // The lecturer may have generated a new link (new token) since this QR/link was
    // printed. Pick the "current" link: active session for this course on today's date
    // that is not expired. If the student opened an old/previous session token, we
    // tell them which token is current so the page can refresh to it. If none exists
    // for today, tell the student no attendance link was found.
    const openedTokenExpired = !!session.expiresAt && session.expiresAt.getTime() <= Date.now();
    const isSessionForToday = session.date === today;

    // Only look for a "current" redirect if the opened token is stale:
    // - not today's session, OR expired, OR closed
    // If the opened token IS today's active non-expired session, serve it directly.
    let currentToken: string | null = null;
    let noSessionToday = false;

    const isOpenedTokenCurrent =
      isSessionForToday &&
      session.status === "active" &&
      !openedTokenExpired;

    if (!isOpenedTokenCurrent) {
      const current = await prisma.attendanceSession.findFirst({
        where: {
          courseId: session.courseId,
          date: today,
          status: "active",
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
      });
      currentToken = current?.token || null;
      noSessionToday = !current;
    }

    const enrolled = isEnrolled(user, session.course);

    const activeSemester = await prisma.semester.findFirst({ where: { status: "Active" } });
    const semesterId = activeSemester?.id;

    let submission = null;
    if (semesterId) {
      const record = await prisma.attendance.findFirst({
        where: {
          studentId: user.id,
          courseId: session.courseId,
          date: session.date,
          semesterId,
        },
      });
      if (record) submission = { status: record.status, source: record.source, date: record.date };
    }

    return successResponse({
      course: session.course,
      date: session.date,
      sessionStatus: session.status,
      token: session.token,
      enrolled,
      submission,
      expiresAt: session.expiresAt,
      resolved: {
        currentToken,
        noSessionToday,
        openedTokenExpired,
      },
    });
  } catch {
    return errorResponse("Failed to fetch attendance session", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "lecturer" && user.role !== "admin") return forbiddenResponse();

    const { token } = await params;
    const { status } = await req.json();

    if (!status || !["active", "closed"].includes(status)) {
      return errorResponse("status must be 'active' or 'closed'");
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      include: { course: { select: { id: true, lecturerIds: true } } },
    });
    if (!session) return notFoundResponse("Attendance session not found");

    const course = session.course;
    if (user.role !== "admin" && !course.lecturerIds.includes(user.id)) {
      return errorResponse("You are not assigned to this course", 403);
    }

    const updated = await prisma.attendanceSession.update({
      where: { id: session.id },
      data: { status },
    });

    return successResponse(updated, status === "active" ? "Session reopened" : "Session closed");
  } catch {
    return errorResponse("Failed to update attendance session", 500);
  }
}
