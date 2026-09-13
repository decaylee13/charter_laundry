"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const inputClass =
  "rounded-lg border border-tint bg-cream px-3 py-2 text-base outline-none focus:border-amber focus:ring-2 focus:ring-gold/40";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );
  // "back to net id" is the only client-driven override; the server response
  // otherwise decides which step we're on, so no effect is needed to sync it.
  const [wentBack, setWentBack] = useState(false);

  const stepFromServer = state && "step" in state && state.step === "name" ? state : null;
  const step = !wentBack && stepFromServer ? "name" : "netid";
  const netId = stepFromServer?.netId ?? "";

  const error = state && "error" in state ? state.error : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {step === "netid" ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Net ID</span>
          <input
            name="netId"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="ab1234"
            required
            autoFocus
            onChange={() => wentBack && setWentBack(false)}
            className={inputClass}
          />
        </label>
      ) : (
        <>
          <input type="hidden" name="netId" value={netId} />
          <p className="text-sm text-ink/70">
            New here — <strong>{netId}</strong>. Tell us your name so other
            officers know whose reservation is whose.
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">First name</span>
            <input
              name="firstName"
              autoComplete="given-name"
              required
              maxLength={40}
              autoFocus
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Last name</span>
            <input
              name="lastName"
              autoComplete="family-name"
              required
              maxLength={40}
              className={inputClass}
            />
          </label>
        </>
      )}

      {error ? <p className="text-sm text-maroon">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-maroon px-3 py-2 text-sm font-medium text-cream hover:bg-oxblood disabled:opacity-50"
      >
        {pending ? "…" : step === "name" ? "Create account" : "Continue"}
      </button>

      {step === "name" ? (
        <button
          type="button"
          onClick={() => setWentBack(true)}
          className="text-xs text-ink/50 underline"
        >
          ← use a different net ID
        </button>
      ) : null}
    </form>
  );
}
