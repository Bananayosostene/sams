import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { signAccessToken, signRefreshToken, setAuthCookies } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    if (!trimmedEmail || !trimmedPassword) {
      return errorResponse("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    if (user.status === "pending") {
      return errorResponse("Please complete your account setup first. Check your email for the invitation link.", 403);
    }

    if (!user.password) {
      return errorResponse("Account setup incomplete. Please contact your admin.", 403);
    }

    const valid = await bcrypt.compare(trimmedPassword, user.password);
    if (!valid) {
      return errorResponse("Invalid email or password", 401);
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    await setAuthCookies(accessToken, refreshToken);

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationNumber: user.registrationNumber,
        facultyId: user.facultyId,
        assignedCourses: user.assignedCourses,
      },
      accessToken,
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
