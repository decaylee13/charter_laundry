# Charter Laundry

A laundry-machine reservation site for Charter Club officers. NetID login (same
scheme as [chool](../chool)), one washer, one dryer, free-form start/end time
booking.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Drizzle ORM + Neon Postgres
· `jose` for signed session cookies (no session table — see `src/lib/session.ts`).

## Getting started

```bash
cp .env.example .env.local   # fill in DATABASE_URL / DATABASE_URL_UNPOOLED / SESSION_SECRET
npm install
npm run db:push              # create tables
npm run db:seed              # seed the washer + dryer rows, and an admin
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Rules

- One net ID per person. First sign-in asks for first + last name; returning
  officers just enter their net ID.
- Each officer may hold at most **one upcoming reservation per machine type**
  (one washer + one dryer) at a time — enforced in `src/app/actions/reservations.ts`.
- Reservations are free-form start/end times (no fixed slot grid), and cannot
  overlap another reservation on the same machine.
- All officers can see whose name is on a booking (no anonymous reservations).
