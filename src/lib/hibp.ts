import { LOCAL_BREACH_FALLBACK, LOCAL_PWNED_NAMES } from "./seed";
import type { BreachRecord, Identity } from "./types";

const LOCAL_COMMON_PASSWORDS = new Set(
  [
    "password",
    "password1",
    "password123",
    "passwort",
    "passwort1",
    "passwort123",
    "123456",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty",
    "qwertz",
    "qwertz123",
    "abc123",
    "admin",
    "admin123",
    "welcome",
    "welcome1",
    "letmein",
    "monkey",
    "dragon",
    "master",
    "login",
    "p@ssw0rd",
    "p@ssword",
    "passw0rd",
    "adlerwerk",
    "adlerwerk1",
    "adlerwerk2024",
    "adlerwerk2025",
    "adlerwerk2026",
    "sommer2024",
    "sommer2025",
    "winter2024",
    "winter2025",
    "hallo123",
    "hallo1234",
    "changeme",
    "secret",
    "iloveyou",
    "fussball",
    "deutschland",
    "schatz123",
  ].map((s) => s.toLowerCase()),
);

export async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function parseRangeBody(body: string, suffix: string): number {
  const target = suffix.toUpperCase();
  for (const line of body.split(/\r?\n/)) {
    if (!line) continue;
    const [hash, count] = line.split(":");
    if (hash?.toUpperCase() === target) {
      const n = Number.parseInt(count ?? "0", 10);
      return Number.isFinite(n) ? n : 0;
    }
  }
  return 0;
}

export function localPasswordHits(password: string): number {
  return LOCAL_COMMON_PASSWORDS.has(password.toLowerCase()) ? 1_000_000 : 0;
}

export function identityNeedles(identity: Identity): string[] {
  return [identity.sam, identity.upn, identity.mail, identity.displayName]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function localIdentityMatch(needles: string[]): boolean {
  return needles.some((n) => LOCAL_PWNED_NAMES.has(n) || LOCAL_PWNED_NAMES.has(n.split("@")[0] ?? ""));
}

export function localBreachesFor(needles: string[]): BreachRecord[] {
  if (!localIdentityMatch(needles)) return [];
  return LOCAL_BREACH_FALLBACK;
}

export function formatHits(n: number): string {
  return n.toLocaleString("de-DE");
}
