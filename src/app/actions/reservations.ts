"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, lt } from "drizzle-orm";

import { db } from "@/db";
import { machines, reservations } from "@/db/schema";
import { requireUser } from "@/lib/dal";

export type ReserveState = { error: string } | { ok: true } | undefined;

const MIN_MINUTES = 15;
const MAX_MINUTES = 4 * 60;

/**
 * Book a machine for a free-form start/end window.
 *
 * Guardrails:
 *  - start must be in the future, end after start, duration between 15m and 4h.
 *  - no overlap with any other reservation on the same machine.
 *  - an officer may hold at most one upcoming reservation per machine *type*
 *    (one washer + one dryer at a time) — cancel the existing one first.
 */
export async function reserve(
  _prev: ReserveState,
  formData: FormData,
): Promise<ReserveState> {
  const user = await requireUser();

  const machineId = Number(formData.get("machineId"));
  const startTime = new Date(String(formData.get("startTime") ?? ""));
  const endTime = new Date(String(formData.get("endTime") ?? ""));

  if (!machineId || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return { error: "Please fill in the machine and both times." };
  }

  const now = new Date();
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60_000;

  if (startTime.getTime() < now.getTime() - 60_000) {
    return { error: "Start time can't be in the past." };
  }
  if (durationMinutes < MIN_MINUTES) {
    return { error: `Reservations must be at least ${MIN_MINUTES} minutes long.` };
  }
  if (durationMinutes > MAX_MINUTES) {
    return { error: `Reservations can't be longer than ${MAX_MINUTES / 60} hours.` };
  }

  const machine = await db.query.machines.findFirst({
    where: eq(machines.machineId, machineId),
  });
  if (!machine) {
    return { error: "That machine doesn't exist." };
  }

  // Rule: one upcoming reservation per machine type per officer.
  const sameTypeUpcoming = await db.query.reservations.findFirst({
    where: and(
      eq(reservations.netId, user.netId),
      gt(reservations.endTime, now),
    ),
    with: { machine: true },
  });
  if (sameTypeUpcoming && sameTypeUpcoming.machine.type === machine.type) {
    return {
      error: `You already have an upcoming ${machine.type} reservation. Cancel it before booking another.`,
    };
  }

  // Rule: no overlap on the same machine.
  const overlapping = await db.query.reservations.findFirst({
    where: and(
      eq(reservations.machineId, machineId),
      lt(reservations.startTime, endTime),
      gt(reservations.endTime, startTime),
    ),
  });
  if (overlapping) {
    return { error: "That window overlaps an existing reservation on this machine." };
  }

  await db.insert(reservations).values({
    machineId,
    netId: user.netId,
    startTime,
    endTime,
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  return { ok: true };
}

export async function cancelReservation(reservationId: number): Promise<void> {
  const user = await requireUser();

  const target = await db.query.reservations.findFirst({
    where: eq(reservations.reservationId, reservationId),
  });
  if (!target) return;
  if (target.netId !== user.netId && !user.isAdmin) return;

  await db.delete(reservations).where(eq(reservations.reservationId, reservationId));

  revalidatePath("/");
  revalidatePath("/schedule");
}
