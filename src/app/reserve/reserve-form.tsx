"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { reserve, type ReserveState } from "@/app/actions/reservations";
import type { Machine } from "@/db/schema";
import { toEasternInputValue, easternInputValueToDate } from "@/lib/time";

const inputClass =
  "rounded-lg border border-tint bg-cream px-3 py-2 text-base outline-none focus:border-amber focus:ring-2 focus:ring-gold/40";

function toIsoOrEmpty(easternLocalValue: string): string {
  const d = easternInputValueToDate(easternLocalValue);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function ReserveForm({ machines }: { machines: Machine[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ReserveState, FormData>(
    reserve,
    undefined,
  );

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 30 * 60_000);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60_000);
  const [startTime, setStartTime] = useState(toEasternInputValue(defaultStart));
  const [endTime, setEndTime] = useState(toEasternInputValue(defaultEnd));

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

      {/*
        The visible inputs are plain datetime-local strings with no timezone
        (e.g. "2026-09-13T08:08"). We deliberately treat that string as a
        wall-clock time *in Eastern Time* — not the browser's or server's
        timezone — since the machines are physically in Princeton. Submit an
        unambiguous ISO string (with "Z") through hidden fields instead, so
        `new Date(...)` on the server reconstructs the correct instant no
        matter what timezone the server itself runs in.
      */}
      <input type="hidden" name="startTime" value={toIsoOrEmpty(startTime)} />
      <input type="hidden" name="endTime" value={toIsoOrEmpty(endTime)} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Start (Eastern Time)</span>
        <input
          type="datetime-local"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">End (Eastern Time)</span>
        <input
          type="datetime-local"
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
