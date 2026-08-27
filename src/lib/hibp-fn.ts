import { createServerFn } from "@tanstack/react-start";

export const fetchPwnedRange = createServerFn({ method: "POST" })
  .validator((d: { prefix: string }) => {
    if (typeof d?.prefix !== "string" || !/^[0-9A-Fa-f]{5}$/.test(d.prefix)) {
      throw new Error("Ungültiges SHA-1-Präfix");
    }
    return { prefix: d.prefix.toUpperCase() };
  })
  .handler(async ({ data }) => {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${data.prefix}`, {
      headers: {
        "Add-Padding": "true",
        "User-Agent": "PwnWaechter-DC/1.0 (Active Directory password filter)",
      },
    });
    if (!res.ok) {
      throw new Error(`Pwned Passwords antwortet ${res.status}`);
    }
    const text = await res.text();
    return { text };
  });

type HibpBreach = {
  Name: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
};

export const lookupBreachedAccount = createServerFn({ method: "POST" })
  .validator((d: { account: string; apiKey: string }) => {
    if (typeof d?.account !== "string" || d.account.trim().length < 3) {
      throw new Error("Konto fehlt");
    }
    return { account: d.account.trim(), apiKey: (d.apiKey ?? "").trim() };
  })
  .handler(async ({ data }) => {
    if (!data.apiKey) {
      return { mode: "no-key" as const };
    }
    const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(data.account)}?truncateResponse=false`;
    const res = await fetch(url, {
      headers: {
        "hibp-api-key": data.apiKey,
        "User-Agent": "PwnWaechter-DC/1.0 (Active Directory password filter)",
      },
    });
    if (res.status === 404) {
      return { mode: "live" as const, breaches: [] as HibpBreach[] };
    }
    if (res.status === 401) {
      return { mode: "unauthorized" as const };
    }
    if (res.status === 429) {
      return { mode: "ratelimit" as const };
    }
    if (!res.ok) {
      return { mode: "error" as const, status: res.status };
    }
    const breaches = (await res.json()) as HibpBreach[];
    return { mode: "live" as const, breaches };
  });
