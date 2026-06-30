import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";
import { sendInvitationEmail } from "@/app/lib/mail";

export async function GET() {
  try {
    const lecturers = await prisma.user.findMany({
      where: { role: "lecturer" },
      select: {
        id: true, name: true, email: true, facultyId: true, assignedCourses: true,
        faculty: { select: { id: true, name: true, code: true } },
        status: true,
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

    const { name, email, facultyId, assignedCourses } = await req.json();
    if (!name || !email) return errorResponse("Name and email are required");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse("Email already registered", 409);

    const crypto = await import("node:crypto");
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const invitationExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const lecturer = await prisma.user.create({
      data: {
        name, email,
        role: "lecturer",
        facultyId: facultyId || undefined,
        assignedCourses: assignedCourses || [],
        status: "pending",
        invitationToken,
        invitationExpiry,
      },
      select: {
        id: true, name: true, email: true, facultyId: true,
        assignedCourses: true, status: true, createdAt: true,
      },
    });

    if (assignedCourses?.length > 0) {
      for (const courseId of assignedCourses) {
        await prisma.course.update({
          where: { id: courseId },
          data: { lecturerIds: { push: lecturer.id } },
        });
      }
    }

    try {
      await sendInvitationEmail(email, name, "lecturer", invitationToken);
    } catch {
      console.error("Failed to send invitation email to", email);
    }

    return successResponse(lecturer, "Lecturer created successfully. Invitation sent.", 201);
  } catch {
    return errorResponse("Failed to create lecturer", 500);
  }
}
