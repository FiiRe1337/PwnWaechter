export type HibpStatus = "unknown" | "clean" | "pwned" | "watching";

export type BreachRecord = {
  name: string;
  domain: string;
  breachDate: string;
  dataClasses: string[];
};

export type Identity = {
  id: string;
  sam: string;
  upn: string;
  mail: string;
  displayName: string;
  givenName: string;
  surname: string;
  department: string;
  title: string;
  enabled: boolean;
  lastPasswordSet: string;
  hibpStatus: HibpStatus;
  breaches: BreachRecord[];
  lastHibpCheck: string | null;
  sid: string;
  ou: string;
  /** Seeded as appearing in public dumps so the demo works without an API key. */
  knownPwned: boolean;
};

export type PolicyProfile = {
  minLength: number;
  minClasses: number;
  requireUpper: boolean;
  requireLower: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  banUsername: boolean;
  banDisplayName: boolean;
  banPwnedPasswords: boolean;
  minUniqueChars: number;
  maxAgeDays: number;
  historyCount: number;
  banKeyboardWalks: boolean;
  banRepeats: boolean;
  banCommonWords: boolean;
};

export type PolicySet = {
  baseline: PolicyProfile;
  elevated: PolicyProfile;
};

export type PolicyMode = "baseline" | "elevated";

export type CheckResult = {
  code: string;
  label: string;
  detail: string;
  passed: boolean;
  elevatedOnly?: boolean;
};

export type AuditEntry = {
  id: string;
  at: string;
  identityId: string;
  sam: string;
  displayName: string;
  identityPwned: boolean;
  breachCount: number;
  policyApplied: PolicyMode;
  pwnedPasswordHits: number | null;
  hibpReachable: boolean;
  verdict: "allow" | "deny";
  reasons: string[];
  checks: CheckResult[];
};

export type Settings = {
  hibpApiKey: string;
  domain: string;
  dcName: string;
  forest: string;
  filterEnabled: boolean;
  autoElevate: boolean;
  checkPwnedPasswords: boolean;
};

export type GateStep =
  | "idle"
  | "resolve"
  | "hibp-identity"
  | "elevate"
  | "policy"
  | "pwned-password"
  | "decide";
