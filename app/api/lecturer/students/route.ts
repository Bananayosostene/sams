import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/app/lib/api-response";

export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "lecturer") return unauthorizedResponse();

    const courses = await prisma.course.findMany({
      where: { lecturerIds: { has: user.id } },
      select: { id: true, facultyId: true },
    });

    if (courses.length === 0) return successResponse([]);

    const courseIds = courses.map((c) => c.id);
    const facultyIds = [...new Set(courses.map((c) => c.facultyId).filter(Boolean))];

    const students = await prisma.user.findMany({
      where: {
        role: "student",
        ...(facultyIds.length > 0 ? { facultyId: { in: facultyIds } } : {}),
      },
      select: { id: true, name: true, email: true, registrationNumber: true },
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        courseId: { in: courseIds },
        studentId: { in: students.map((s) => s.id) },
      },
      select: { studentId: true, status: true },
    });

    const studentAttendance: Record<string, { present: number; total: number }> = {};
    for (const r of attendanceRecords) {
      if (!studentAttendance[r.studentId]) studentAttendance[r.studentId] = { present: 0, total: 0 };
      studentAttendance[r.studentId].total++;
      if (r.status === "present") studentAttendance[r.studentId].present++;
    }

    const result = students.map((s) => {
      const sa = studentAttendance[s.id];
      const pct = sa && sa.total > 0 ? Math.round((sa.present / sa.total) * 100) : 0;
      return {
        id: s.id,
        regNo: s.registrationNumber,
        name: s.name,
        email: s.email,
        attendancePct: pct,
      };
    }).sort((a, b) => b.attendancePct - a.attendancePct);

    return successResponse(result);
  } catch {
    return errorResponse("Failed to fetch students", 500);
  }
}
