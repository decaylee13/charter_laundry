import type { Metadata } from "next";
import { asc, gt } from "drizzle-orm";

import { db } from "@/db";
import { machines, reservations } from "@/db/schema";
import { requireUser, displayName } from "@/lib/dal";
import { formatWindow } from "@/lib/time";
import { CancelButton } from "@/components/cancel-button";

export const metadata: Metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const user = await requireUser();

  const [allMachines, upcoming] = await Promise.all([
    db.query.machines.findMany({ orderBy: asc(machines.type) }),
    db.query.reservations.findMany({
      where: gt(reservations.endTime, new Date()),
      with: { officer: true, machine: true },
      orderBy: asc(reservations.startTime),
    }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-maroon">Schedule</h1>
        <a
          href="/reserve"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-oxblood hover:bg-amber"
        >
          Reserve a machine
        </a>
      </div>

      <div className="flex flex-col gap-6">
        {allMachines.map((machine) => {
          const bookings = upcoming.filter((r) => r.machineId === machine.machineId);
          return (
            <section
              key={machine.machineId}
              className="overflow-hidden rounded-2xl border border-tint bg-white shadow-sm"
            >
              <div className="bg-maroon px-6 py-3 text-cream">
                <h2 className="text-lg font-semibold capitalize">{machine.label}</h2>
              </div>
              {bookings.length === 0 ? (
                <p className="p-6 text-sm text-ink/60">Nothing booked — it&apos;s open.</p>
              ) : (
                <ul className="divide-y divide-tint">
                  {bookings.map((r) => (
                    <li
                      key={r.reservationId}
                      className="flex flex-wrap items-center justify-between gap-2 px-6 py-3"
                    >
                      <div>
                        <span className="font-medium">{displayName(r.officer)}</span>
                        <span className="ml-2 text-sm text-ink/60">
                          {formatWindow(r.startTime, r.endTime)}
                        </span>
                      </div>
                      {r.netId === user.netId || user.isAdmin ? (
                        <CancelButton reservationId={r.reservationId} />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
