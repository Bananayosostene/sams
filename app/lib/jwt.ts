import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "sams-access-secret-key-2025"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "sams-refresh-secret-key-2025"
);

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

export async function signAccessToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(ACCESS_EXPIRY)
    .setIssuedAt()
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_EXPIRY)
    .setIssuedAt()
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
