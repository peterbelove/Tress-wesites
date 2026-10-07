import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers, type AdminUserRow } from "@/db/schema";

export const SESSION_COOKIE = "tres_admin_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === test.length && timingSafeEqual(test, expected);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function isSecureRequest() {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "";
    return proto.split(",")[0].trim() === "https";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(adminSessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  // Opportunistic cleanup of expired sessions.
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await isSecureRequest(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
  }
  store.delete(SESSION_COOKIE);
}

export type AdminUser = Pick<AdminUserRow, "id" | "email" | "name" | "role">;

/** Returns the authenticated admin for the current request, or null. */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
      .where(
        and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, new Date())),
      )
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
});

/** Server-side guard for admin pages. Redirects to login when unauthenticated. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Guard for server actions / route handlers. Throws instead of redirecting. */
export async function assertAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function authenticate(email: string, password: string) {
  const rows = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase().trim()))
    .limit(1);
  const user = rows[0];
  if (!user) {
    // Burn comparable time to reduce user-enumeration signal.
    verifyPassword(password, "00:00");
    return null;
  }
  return verifyPassword(password, user.passwordHash) ? user : null;
}
