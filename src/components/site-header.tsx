import Link from "next/link";

import { getCurrentUser, displayName } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-oxblood bg-maroon text-cream">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-base ring-1 ring-gold/60">
            🧺
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Charter Laundry
          </span>
        </Link>

        {user ? (
          <>
            <div className="order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto border-t border-oxblood/60 px-4 pt-2 sm:order-none sm:mx-0 sm:w-auto sm:border-0 sm:p-0">
              <nav className="ml-0 flex items-center gap-4 whitespace-nowrap text-base text-cream/85 sm:ml-4">
                <Link href="/schedule" className="hover:text-gold">
                  Schedule
                </Link>
                <Link href="/reserve" className="hover:text-gold">
                  Reserve
                </Link>
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="hidden max-w-[10rem] truncate text-cream/85 sm:inline-block">
                {displayName(user)}
              </span>
              <form action={logout}>
                <button className="rounded border border-cream/25 px-2 py-1 text-xs text-cream/85 hover:border-gold hover:text-gold">
                  Sign out
                </button>
              </form>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
