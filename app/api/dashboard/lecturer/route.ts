import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "lecturer") return unauthorizedResponse();

    const courses = await prisma.course.findMany({
      where: { lecturerIds: { has: user.id } },
      include: {
        _count: { select: { attendance: true } },
        faculty: { select: { code: true } },
        semester: { select: { name: true, academicYear: true } },
      },
    });

    const courseIds = courses.map((c) => c.id);
    const totalStudents = await prisma.user.count({
      where: { facultyId: user.facultyId || undefined, role: "student" },
    });

    const sessionsThisMonth = await prisma.attendance.count({
      where: { recordedById: user.id },
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: { courseId: { in: courseIds } },
    });

    const courseData = courses.map((c) => {
      const courseAttendance = attendanceRecords.filter((a) => a.courseId === c.id);
      const present = courseAttendance.filter((a) => a.status === "present").length;
      const avg = courseAttendance.length > 0 ? Math.round((present / courseAttendance.length) * 100) : 0;
      return {
        id: c.id,
        name: c.name,
        code: c.code,
        credits: c.credits,
        students: totalStudents,
        attendance: avg,
        semester: c.semester,
        faculty: c.faculty,
      };
    });

    return successResponse({
      courses: courseData,
      stats: {
        totalCourses: courses.length,
        totalStudents,
        sessionsThisMonth,
        averageAttendance: courseData.length > 0
          ? Math.round(courseData.reduce((a, c) => a + c.attendance, 0) / courseData.length)
          : 0,
      },
    });
  } catch {
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
