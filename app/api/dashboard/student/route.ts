import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "student") return unauthorizedResponse();

    const courses = await prisma.course.findMany({
      where: { facultyId: user.facultyId || undefined },
      select: { id: true, name: true, code: true, credits: true },
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: user.id },
      select: { courseId: true, status: true },
    });

    const courseAttendance = courses.map((c) => {
      const records = attendanceRecords.filter((a) => a.courseId === c.id);
      const total = records.length;
      const attended = records.filter((r) => r.status !== "absent").length;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
      return { ...c, attended, total, percentage };
    });

    const overallPercentage = courseAttendance.length > 0
      ? Math.round(courseAttendance.reduce((a, c) => a + c.percentage, 0) / courseAttendance.length)
      : 0;

    const totalAttended = courseAttendance.reduce((a, c) => a + c.attended, 0);
    const totalClasses = courseAttendance.reduce((a, c) => a + c.total, 0);
    const missed = totalClasses - totalAttended;

    return successResponse({
      courses: courseAttendance,
      stats: {
        overallAttendance: overallPercentage,
        coursesEnrolled: courses.length,
        classesAttended: totalAttended,
        classesMissed: missed,
      },
    });
  } catch {
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
