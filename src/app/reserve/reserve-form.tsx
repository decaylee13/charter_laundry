"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { reserve, type ReserveState } from "@/app/actions/reservations";
import type { Machine } from "@/db/schema";
import { toLocalInputValue } from "@/lib/time";

const inputClass =
  "rounded-lg border border-tint bg-cream px-3 py-2 text-base outline-none focus:border-amber focus:ring-2 focus:ring-gold/40";

export function ReserveForm({ machines }: { machines: Machine[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ReserveState, FormData>(
    reserve,
    undefined,
  );

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 30 * 60_000);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60_000);
  const [startTime, setStartTime] = useState(toLocalInputValue(defaultStart));
  const [endTime, setEndTime] = useState(toLocalInputValue(defaultEnd));

  const error = state && "error" in state ? state.error : null;

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push("/schedule");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Machine</span>
        <select name="machineId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Choose a machine
          </option>
          {machines.map((m) => (
            <option key={m.machineId} value={m.machineId}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Start</span>
        <input
          type="datetime-local"
          name="startTime"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">End</span>
        <input
          type="datetime-local"
          name="endTime"
          required
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className={inputClass}
        />
      </label>

      {error ? <p className="text-sm text-maroon">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-maroon px-3 py-2 text-sm font-medium text-cream hover:bg-oxblood disabled:opacity-50"
      >
        {pending ? "…" : "Reserve"}
      </button>
    </form>
  );
}
