import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { token, name, password } = await req.json();
    if (!token || !name || !password) {
      return errorResponse("Token, name, and password are required");
    }

    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters");
    }

    const user = await prisma.user.findUnique({ where: { invitationToken: token } });
    if (!user) {
      return errorResponse("Invalid or expired invitation token", 400);
    }

    if (user.status !== "pending") {
      return errorResponse("This invitation has already been used", 400);
    }

    if (user.invitationExpiry && new Date() > user.invitationExpiry) {
      return errorResponse("Invitation has expired. Please contact your admin.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        password: hashedPassword,
        status: "active",
        invitationToken: null,
        invitationExpiry: null,
      },
    });

    return successResponse(
      { email: user.email, role: user.role },
      "Account created successfully. You can now log in."
    );
  } catch {
    return errorResponse("Failed to complete registration", 500);
  }
}
