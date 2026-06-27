import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

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
    if (user.role !== "admin") return forbiddenResponse();

    const { name, email, password, registrationNumber, facultyId } = await req.json();
    if (!name || !email || !password || !registrationNumber) {
      return errorResponse("Name, email, password, and registration number are required");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse("Email already registered", 409);

    const regDup = await prisma.user.findFirst({ where: { registrationNumber } });
    if (regDup) return errorResponse("Registration number already exists", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await prisma.user.create({
      data: {
        name, email, password: hashedPassword,
        role: "student",
        registrationNumber,
        facultyId: facultyId || undefined,
        assignedCourses: [],
      },
      select: { id: true, name: true, email: true, registrationNumber: true, facultyId: true },
    });
    return successResponse(student, "Student created successfully", 201);
  } catch {
    return errorResponse("Failed to create student", 500);
  }
}
