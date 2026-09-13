"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, deleteSession } from "@/lib/session";
import { isValidNetId, normalizeNetId } from "@/lib/netid";

export type LoginState =
  | { error: string }
  | { step: "name"; netId: string }
  | undefined;

/**
 * Two-step login:
 *  1. Net ID only. Known -> sign in. Unknown -> ask for first + last name.
 *  2. Net ID (hidden) + first/last name -> create the account and sign in.
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const netId = normalizeNetId(String(formData.get("netId") ?? ""));
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!isValidNetId(netId)) {
    return { error: "Net ID must be two letters followed by four digits (e.g. ab1234)." };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.netId, netId),
  });

  if (existing) {
    await createSession(netId);
    redirect("/");
  }

  // New account — step 2.
  if (!firstName || !lastName) {
    return { step: "name", netId };
  }
  if (firstName.length > 40 || lastName.length > 40) {
    return { error: "Names must be 40 characters or fewer." };
  }

  await db.insert(users).values({ netId, firstName, lastName }).onConflictDoNothing();
  await createSession(netId);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
