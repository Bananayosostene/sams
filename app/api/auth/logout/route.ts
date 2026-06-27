import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { verifyAccessToken } from "@/app/lib/auth";
import { successResponse } from "@/app/lib/api-response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshToken: null },
        });
      }
    }

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return successResponse(null, "Logged out successfully");
  } catch {
    return successResponse(null, "Logged out successfully");
  }
}
