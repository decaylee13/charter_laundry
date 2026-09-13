import Link from "next/link";
import { and, asc, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { reservations } from "@/db/schema";
import { requireUser, displayName } from "@/lib/dal";
import { formatWindow } from "@/lib/time";
import { CancelButton } from "@/components/cancel-button";

export default async function DashboardPage() {
  const user = await requireUser();

  const upcoming = await db.query.reservations.findMany({
    where: and(eq(reservations.netId, user.netId), gt(reservations.endTime, new Date())),
    with: { machine: true },
    orderBy: asc(reservations.startTime),
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <section className="overflow-hidden rounded-2xl border border-tint bg-white shadow-sm">
        <div className="bg-maroon px-6 py-5 text-cream">
          <p className="text-xs uppercase tracking-widest text-gold">Signed in as</p>
          <h1 className="mt-1 text-2xl font-semibold">
            {displayName(user)}
            <span className="ml-2 text-base font-normal text-cream/60">
              {user.netId}
            </span>
            {user.isAdmin ? (
              <span className="ml-2 rounded bg-gold px-1.5 py-0.5 align-middle text-xs font-medium text-oxblood">
                admin
              </span>
            ) : null}
          </h1>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink/50">
            Your upcoming reservations
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">
              Nothing booked yet. Head to{" "}
              <Link href="/reserve" className="text-maroon underline">
                Reserve
              </Link>{" "}
              to grab the washer or dryer.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {upcoming.map((r) => (
                <li
                  key={r.reservationId}
                  className="flex items-center justify-between rounded-lg border border-tint px-4 py-3"
                >
                  <div>
                    <span className="font-medium capitalize text-maroon">
                      {r.machine.label}
                    </span>
                    <span className="ml-2 text-sm text-ink/70">
                      {formatWindow(r.startTime, r.endTime)}
                    </span>
                  </div>
                  <CancelButton reservationId={r.reservationId} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/reserve"
          className="rounded-lg bg-gold px-4 py-2 font-medium text-oxblood hover:bg-amber"
        >
          Reserve a machine
        </Link>
        <Link
          href="/schedule"
          className="rounded-lg border border-tint bg-white px-4 py-2 hover:border-amber"
        >
          Full schedule
        </Link>
      </nav>
    </main>
  );
}
