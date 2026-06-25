import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    const lecturers = await prisma.user.findMany({
      where: { role: "lecturer" },
      select: {
        id: true, name: true, email: true, facultyId: true, assignedCourses: true,
        faculty: { select: { id: true, name: true, code: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(lecturers);
  } catch {
    return errorResponse("Failed to fetch lecturers", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { name, email, password, facultyId, assignedCourses } = await req.json();
    if (!name || !email || !password) return errorResponse("Name, email, and password are required");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse("Email already registered", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const lecturer = await prisma.user.create({
      data: {
        name, email, password: hashedPassword,
        role: "lecturer",
        facultyId: facultyId || undefined,
        assignedCourses: assignedCourses || [],
      },
      select: { id: true, name: true, email: true, facultyId: true, assignedCourses: true },
    });

    if (assignedCourses?.length > 0) {
      for (const courseId of assignedCourses) {
        await prisma.course.update({
          where: { id: courseId },
          data: { lecturerIds: { push: lecturer.id } },
        });
      }
    }

    return successResponse(lecturer, "Lecturer created successfully", 201);
  } catch {
    return errorResponse("Failed to create lecturer", 500);
  }
}
