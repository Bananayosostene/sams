import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { signAccessToken, signRefreshToken, setAuthCookies } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.password);
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
