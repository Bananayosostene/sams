import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");
    const semesterId = searchParams.get("semesterId");
    const lecturerId = searchParams.get("lecturerId");

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;
    if (semesterId) where.semesterId = semesterId;

    if (lecturerId || user.role === "lecturer") {
      where.recordedById = lecturerId || user.id;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, registrationNumber: true, email: true } },
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, name: true, academicYear: true } },
      },
      orderBy: { date: "desc" },
    });
    return successResponse(attendance);
  } catch {
    return errorResponse("Failed to fetch attendance", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "lecturer" && user.role !== "admin") return forbiddenResponse();

    const { courseId, date, records, semesterId } = await req.json();
    if (!courseId || !date || !records || !Array.isArray(records)) {
      return errorResponse("Course ID, date, records array are required");
    }

    const activeSemester = semesterId || (await prisma.semester.findFirst({ where: { status: "Active" } }))?.id;
    if (!activeSemester) return errorResponse("No active semester found");

    const created = [];
    for (const record of records) {
      const { studentId, status } = record;
      if (!studentId || !status) continue;

      const existing = await prisma.attendance.findFirst({
        where: { studentId, courseId, date, semesterId: activeSemester },
      });

      if (existing) {
        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: { status, recordedById: user.id },
        });
        created.push(updated);
      } else {
        const att = await prisma.attendance.create({
          data: {
            studentId,
            courseId,
            date,
            status,
            recordedById: user.id,
            semesterId: activeSemester,
          },
        });
        created.push(att);
      }
    }

    return successResponse(created, "Attendance saved successfully", 201);
  } catch {
    return errorResponse("Failed to save attendance", 500);
  }
}
