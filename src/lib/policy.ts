import type { CheckResult, Identity, PolicyMode, PolicyProfile } from "./types";

const SPECIAL = /[^A-Za-z0-9]/;
const WALKS = [
  "qwertz",
  "qwerty",
  "asdfgh",
  "yxcvbn",
  "12345",
  "123456",
  "09876",
  "1qay2wsx",
  "qaywsx",
  "abcdef",
];
const COMMON_WORDS = [
  "passwort",
  "password",
  "adlerwerk",
  "sommer",
  "winter",
  "fruehling",
  "frühling",
  "herbst",
  "fussball",
  "fußball",
  "deutschland",
  "hallo",
  "welcome",
  "changeme",
  "secret",
  "login",
  "admin",
  "qweasd",
  "iloveyou",
  "schatz",
  "sonne",
  "mond",
  "sterne",
];

function classesOf(pw: string): number {
  let n = 0;
  if (/[a-z]/.test(pw)) n += 1;
  if (/[A-Z]/.test(pw)) n += 1;
  if (/\d/.test(pw)) n += 1;
  if (SPECIAL.test(pw)) n += 1;
  return n;
}

function uniqueChars(pw: string): number {
  return new Set([...pw]).size;
}

function hasWalk(pw: string): boolean {
  const lower = pw.toLowerCase();
  return WALKS.some((w) => lower.includes(w));
}

function hasRepeatRun(pw: string): boolean {
  return /(.)\1{2,}/.test(pw);
}

function containsAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles
    .map((n) => n.toLowerCase())
    .filter((n) => n.length >= 3)
    .some((n) => h.includes(n));
}

function hasCommonWord(pw: string): boolean {
  const lower = pw.toLowerCase();
  return COMMON_WORDS.some((w) => lower.includes(w));
}

export function policyModeFor(
  identity: Identity,
  autoElevate: boolean,
): PolicyMode {
  if (!autoElevate) return "baseline";
  if (identity.hibpStatus === "pwned") return "elevated";
  if (identity.knownPwned) return "elevated";
  return "baseline";
}

export function evaluatePassword(opts: {
  password: string;
  identity: Identity;
  policy: PolicyProfile;
  mode: PolicyMode;
  pwnedHits: number | null;
  hibpReachable: boolean;
}): CheckResult[] {
  const { password, identity, policy, mode, pwnedHits, hibpReachable } = opts;
  const elevated = mode === "elevated";
  const results: CheckResult[] = [];

  results.push({
    code: "length",
    label: `Mindestlänge ${policy.minLength}`,
    detail: `${password.length} / ${policy.minLength} Zeichen`,
    passed: password.length >= policy.minLength,
  });

  results.push({
    code: "classes",
    label: `${policy.minClasses} Zeichenklassen`,
    detail: `${classesOf(password)} von 4 (klein, groß, Ziffer, Sonderzeichen)`,
    passed: classesOf(password) >= policy.minClasses,
  });

  if (policy.requireUpper) {
    results.push({
      code: "upper",
      label: "Großbuchstabe",
      detail: "Mindestens ein A–Z",
      passed: /[A-Z]/.test(password),
    });
  }
  if (policy.requireLower) {
    results.push({
      code: "lower",
      label: "Kleinbuchstabe",
      detail: "Mindestens ein a–z",
      passed: /[a-z]/.test(password),
    });
  }
  if (policy.requireDigit) {
    results.push({
      code: "digit",
      label: "Ziffer",
      detail: "Mindestens eine 0–9",
      passed: /\d/.test(password),
    });
  }
  if (policy.requireSpecial) {
    results.push({
      code: "special",
      label: "Sonderzeichen",
      detail: "Mindestens ein nicht-alphanumerisches Zeichen",
      passed: SPECIAL.test(password),
      elevatedOnly: elevated && policy.requireSpecial,
    });
  }

  results.push({
    code: "unique",
    label: `${policy.minUniqueChars} unterschiedliche Zeichen`,
    detail: `${uniqueChars(password)} einzigartige Zeichen`,
    passed: uniqueChars(password) >= policy.minUniqueChars,
  });

  if (policy.banUsername) {
    const needles = [identity.sam, identity.upn.split("@")[0] ?? "", identity.mail.split("@")[0] ?? ""];
    const hit = containsAny(password, needles);
    results.push({
      code: "username",
      label: "Kein Kontoname im Passwort",
      detail: hit ? "Enthält sAMAccountName oder UPN-Präfix" : "Kontoname nicht enthalten",
      passed: !hit,
    });
  }

  if (policy.banDisplayName) {
    const needles = [identity.givenName, identity.surname, identity.displayName];
    const hit = containsAny(password, needles);
    results.push({
      code: "displayname",
      label: "Kein Anzeigename im Passwort",
      detail: hit ? "Enthält Vor- oder Nachnamen" : "Name nicht enthalten",
      passed: !hit,
    });
  }

  if (policy.banKeyboardWalks) {
    const hit = hasWalk(password);
    results.push({
      code: "walk",
      label: "Keine Tastaturfolgen",
      detail: hit ? "QWERTZ-/Zahlenfolge erkannt" : "Keine Walks",
      passed: !hit,
      elevatedOnly: true,
    });
  }

  if (policy.banRepeats) {
    const hit = hasRepeatRun(password);
    results.push({
      code: "repeat",
      label: "Keine Zeichenwiederholung",
      detail: hit ? "Drei gleiche Zeichen hintereinander" : "Keine Runs",
      passed: !hit,
      elevatedOnly: true,
    });
  }

  if (policy.banCommonWords) {
    const hit = hasCommonWord(password);
    results.push({
      code: "common",
      label: "Keine Wörterbuchwörter",
      detail: hit ? "Enthält häufiges deutsches/englisches Wort" : "Kein Treffer im Katalog",
      passed: !hit,
      elevatedOnly: true,
    });
  }

  if (policy.banPwnedPasswords) {
    if (pwnedHits === null) {
      results.push({
        code: "hibp-pw",
        label: "Nicht in Pwned Passwords",
        detail: hibpReachable
          ? "Prüfung steht aus"
          : "HIBP nicht erreichbar — lokaler Katalog genutzt",
        passed: true,
      });
    } else if (pwnedHits > 0) {
      results.push({
        code: "hibp-pw",
        label: "Nicht in Pwned Passwords",
        detail: `${pwnedHits.toLocaleString("de-DE")} mal in öffentlichen Leaks gesehen`,
        passed: false,
      });
    } else {
      results.push({
        code: "hibp-pw",
        label: "Nicht in Pwned Passwords",
        detail: "SHA-1-Bereich ohne Treffer (k-Anonymität)",
        passed: true,
      });
    }
  }

  return results;
}

export function allPassed(checks: CheckResult[]): boolean {
  return checks.every((c) => c.passed);
}

export function strengthScore(password: string, checks: CheckResult[]): number {
  if (!password) return 0;
  const ratio = checks.filter((c) => c.passed).length / Math.max(checks.length, 1);
  const lengthBonus = Math.min(password.length / 24, 1) * 0.15;
  return Math.round(Math.min(1, ratio * 0.85 + lengthBonus) * 100);
}

export function describePolicy(p: PolicyProfile): string[] {
  const lines = [
    `Mindestlänge ${p.minLength}`,
    `${p.minClasses} von 4 Zeichenklassen`,
  ];
  if (p.requireSpecial) lines.push("Sonderzeichen Pflicht");
  if (p.banPwnedPasswords) lines.push("Pwned Passwords gesperrt");
  if (p.banKeyboardWalks) lines.push("Tastaturfolgen gesperrt");
  if (p.banCommonWords) lines.push("Wörterbuchwörter gesperrt");
  lines.push(`Max. Alter ${p.maxAgeDays} Tage`);
  lines.push(`Verlauf ${p.historyCount}`);
  return lines;
}
