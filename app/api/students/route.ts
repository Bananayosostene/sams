import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";
import { sendInvitationEmail } from "@/app/lib/mail";

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

    const targetFacultyId = user.role === "lecturer" ? user.facultyId : (facultyId || undefined);

    if (user.role === "lecturer" && !targetFacultyId) {
      return errorResponse("You are not assigned to any faculty");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse("Email already registered", 409);

    const regDup = await prisma.user.findFirst({ where: { registrationNumber } });
    if (regDup) return errorResponse("Registration number already exists", 409);

    if (user.role === "lecturer") {
      const courses = await prisma.course.findMany({
        where: { lecturerIds: { has: user.id }, facultyId: targetFacultyId },
      });
      if (courses.length === 0) {
        return errorResponse("No courses found in your faculty to add students to");
      }
    }

    const crypto = await import("node:crypto");
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const invitationExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const student = await prisma.user.create({
      data: {
        name, email,
        role: "student",
        registrationNumber,
        facultyId: targetFacultyId,
        assignedCourses: [],
        status: "pending",
        invitationToken,
        invitationExpiry,
      },
      select: {
        id: true, name: true, email: true, registrationNumber: true,
        facultyId: true, status: true, createdAt: true,
      },
    });

    try {
      await sendInvitationEmail(email, name, "student", invitationToken);
    } catch {
      console.error("Failed to send invitation email to", email);
    }

    return successResponse(student, "Student created successfully. Invitation sent.", 201);
  } catch {
    return errorResponse("Failed to create student", 500);
  }
}
