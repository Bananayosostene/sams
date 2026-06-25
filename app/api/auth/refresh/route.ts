import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/app/lib/api-response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) {
      return unauthorizedResponse("No refresh token provided");
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return unauthorizedResponse("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== refreshToken) {
      return unauthorizedResponse("Invalid refresh token");
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    await setAuthCookies(newAccessToken, newRefreshToken);

    return successResponse({ accessToken: newAccessToken });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
