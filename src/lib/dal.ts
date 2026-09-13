import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { getSession } from "@/lib/session";

/**
 * Data Access Layer. Every server component / action / route handler that needs
 * "the logged-in officer" goes through here, so the auth check is never forgotten.
 *
 * `cache()` memoizes the result for the duration of one request, so calling
 * `getCurrentUser()` in five components does one DB query, not five.
 */

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.netId, session.netId),
  });

  return user ?? null;
});

/** Use in protected pages/actions. Redirects to /login if not signed in. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Use in admin-only pages/actions. Redirects home if not an admin. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/");
  return user;
}

export function displayName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`;
}
