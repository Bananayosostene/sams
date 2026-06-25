import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") return unauthorizedResponse();

    const [faculties, courses, lecturers, students, activeSemester] = await Promise.all([
      prisma.faculty.count(),
      prisma.course.count(),
      prisma.user.count({ where: { role: "lecturer" } }),
      prisma.user.count({ where: { role: "student" } }),
      prisma.semester.findFirst({ where: { status: "Active" } }),
    ]);

    const recentActivity = await prisma.user.findMany({
      where: { role: { in: ["student", "lecturer"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { name: true, role: true, createdAt: true },
    });

    return successResponse({
      stats: { faculties, courses, lecturers, students },
      activeSemester,
      recentActivity,
    });
  } catch {
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
