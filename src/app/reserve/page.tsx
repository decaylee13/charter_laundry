import type { Metadata } from "next";
import { asc } from "drizzle-orm";

import { db } from "@/db";
import { machines } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { ReserveForm } from "./reserve-form";

export const metadata: Metadata = { title: "Reserve" };

export default async function ReservePage() {
  await requireUser();
  const allMachines = await db.query.machines.findMany({ orderBy: asc(machines.type) });

  return (
    <main className="mx-auto max-w-sm px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-maroon">Reserve a machine</h1>
      <p className="mb-6 text-sm text-ink/60">
        Pick a start and end time. One upcoming washer reservation and one
        upcoming dryer reservation per officer at a time.
      </p>
      <div className="rounded-2xl border border-tint bg-white p-6 shadow-sm">
        <ReserveForm machines={allMachines} />
      </div>
    </main>
  );
}
