/**
 * The house is in Princeton, NJ — every displayed time and every submitted
 * reservation time is anchored to Eastern Time, regardless of what timezone
 * the server happens to run in (Vercel defaults to UTC) or what timezone an
 * officer's device is set to. `America/New_York` handles the EST/EDT switch
 * automatically.
 */
export const TIME_ZONE = "America/New_York";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: TIME_ZONE,
});
const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

function easternDateKey(d: Date): string {
  // en-CA formats as YYYY-MM-DD, giving us a plain string to compare "same
  // day" by — computed in Eastern Time, not the server's local timezone.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** e.g. "Sat, Sep 13 · 4:00 PM – 5:30 PM ET" */
export function formatWindow(start: Date, end: Date): string {
  const sameDay = easternDateKey(start) === easternDateKey(end);
  return sameDay
    ? `${dateFmt.format(start)} · ${timeFmt.format(start)} – ${timeFmt.format(end)} ET`
    : `${dateFmt.format(start)} ${timeFmt.format(start)} – ${dateFmt.format(end)} ${timeFmt.format(end)} ET`;
}

/** Value for a `datetime-local` input, expressed as Eastern Time wall-clock. */
export function toEasternInputValue(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * Inverse of `toEasternInputValue`: takes a `datetime-local` string that
 * represents a wall-clock time *in Eastern Time* and returns the absolute
 * instant (Date) it refers to — regardless of what timezone this code
 * happens to be running in (browser or server).
 *
 * Standard trick: read the naive string as if it were UTC, see what that
 * instant reads as when formatted in Eastern Time, and shift by the
 * difference. Works across the EST/EDT boundary automatically.
 */
export function easternInputValueToDate(value: string): Date {
  const utcGuess = new Date(`${value}Z`);
  if (Number.isNaN(utcGuess.getTime())) return utcGuess;

  const easternReading = utcGuess.toLocaleString("en-US", { timeZone: TIME_ZONE });
  const asIfLocal = new Date(easternReading);
  const diff = utcGuess.getTime() - asIfLocal.getTime();
  return new Date(utcGuess.getTime() + diff);
}
