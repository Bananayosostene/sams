import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { signAccessToken as jwtSignAccess, signRefreshToken as jwtSignRefresh, verifyAccessToken as jwtVerifyAccess, verifyRefreshToken as jwtVerifyRefresh } from "./jwt";

export type { TokenPayload } from "./jwt";

export async function signAccessToken(payload: { userId: string; email: string; role: string }) {
  return jwtSignAccess(payload);
}

export async function signRefreshToken(payload: { userId: string; email: string; role: string }) {
  return jwtSignRefresh(payload);
}

export async function verifyAccessToken(token: string) {
  return jwtVerifyAccess(token);
}

export async function verifyRefreshToken(token: string) {
  return jwtVerifyRefresh(token);
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) return null;

  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user;
}
