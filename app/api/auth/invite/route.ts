import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";
import { sendInvitationEmail } from "@/app/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { email } = await req.json();
    if (!email) return errorResponse("Email is required");

    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) return errorResponse("User not found", 404);
    if (target.status !== "pending") return errorResponse("User already completed registration", 400);

    const crypto = await import("node:crypto");
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const invitationExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: target.id },
      data: { invitationToken, invitationExpiry },
    });

    await sendInvitationEmail(target.email, target.name, target.role, invitationToken);

    return successResponse(null, "Invitation sent successfully");
  } catch {
    return errorResponse("Failed to send invitation", 500);
  }
}
