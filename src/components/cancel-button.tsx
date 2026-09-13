"use client";

import { useTransition } from "react";
import { cancelReservation } from "@/app/actions/reservations";

export function CancelButton({ reservationId }: { reservationId: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          if (confirm("Cancel this reservation?")) {
            await cancelReservation(reservationId);
          }
        })
      }
      disabled={pending}
      className="rounded border border-tint px-2 py-1 text-xs text-ink/60 hover:border-maroon hover:text-maroon disabled:opacity-50"
    >
      {pending ? "…" : "Cancel"}
    </button>
  );
}
