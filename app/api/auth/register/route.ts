import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, registrationNumber, facultyId } = await req.json();

    if (!email || !password || !name || !role) {
      return errorResponse("Email, password, name, and role are required");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        registrationNumber,
        facultyId: facultyId || undefined,
        assignedCourses: [],
      },
    });

    return successResponse(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      "User created successfully",
      201
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
