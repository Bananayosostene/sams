import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";
import { sendStudentCredentialsEmail } from "@/app/lib/mail";
import { createNotificationForRole } from "@/app/lib/notification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("facultyId");
    const courseId = searchParams.get("courseId");

    let facultyFilter = facultyId || undefined;
    if (courseId && !facultyFilter) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { facultyId: true },
      });
      if (course) facultyFilter = course.facultyId;
    }

    const students = await prisma.user.findMany({
      where: { role: "student", ...(facultyFilter ? { facultyId: facultyFilter } : {}) },
      select: {
        id: true, name: true, email: true, registrationNumber: true, facultyId: true,
        faculty: { select: { id: true, name: true, code: true } },
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(students);
  } catch {
    return errorResponse("Failed to fetch students", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin" && user.role !== "lecturer") return forbiddenResponse();

    const { name, email, registrationNumber, facultyId } = await req.json();
    if (!name || !email || !registrationNumber) {
      return errorResponse("Name, email, and registration number are required");
    }

    let targetFacultyId = user.role === "lecturer" ? (facultyId || user.facultyId) : (facultyId || undefined);

    if (user.role === "lecturer" && !targetFacultyId) {
      const course = await prisma.course.findFirst({
        where: { lecturerIds: { has: user.id } },
        select: { facultyId: true },
      });
      if (course) targetFacultyId = course.facultyId;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse("Email already registered", 409);

    const regDup = await prisma.user.findFirst({ where: { registrationNumber } });
    if (regDup) return errorResponse("Registration number already exists", 409);

    const password = await bcrypt.hash(registrationNumber, 12);

    const student = await prisma.user.create({
      data: {
        name, email,
        role: "student",
        registrationNumber,
        password,
        facultyId: targetFacultyId,
        assignedCourses: [],
        status: "active",
      },
      select: {
        id: true, name: true, email: true, registrationNumber: true,
        facultyId: true, status: true, createdAt: true,
      },
    });

    try {
      await sendStudentCredentialsEmail(email, name, registrationNumber);
    } catch {
      console.error("Failed to send credentials email to", email);
    }

    createNotificationForRole("admin", {
      title: "New Student Registered",
      message: `${name} (${registrationNumber}) has been registered as a student.`,
      type: "info",
      link: "/admin/students",
    }).catch(() => {});

    return successResponse(student, "Student created successfully. Login credentials sent.", 201);
  } catch {
    return errorResponse("Failed to create student", 500);
  }
}
