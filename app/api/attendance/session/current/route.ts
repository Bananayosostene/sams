import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "student") return forbiddenResponse();

    const today = new Date().toISOString().split("T")[0];

    const enrolledCourses = await prisma.course.findMany({
      where: {
        OR: [
          { facultyId: user.facultyId ?? undefined },
          { id: { in: user.assignedCourses } },
        ],
      },
      select: { id: true },
    });

    const courseIds = enrolledCourses.map((c) => c.id);

    const session = await prisma.attendanceSession.findFirst({
      where: {
        courseId: { in: courseIds },
        date: today,
        status: "active",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ token: session?.token || null });
  } catch {
    return errorResponse("Failed to find current session", 500);
  }
}
