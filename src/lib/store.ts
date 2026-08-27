import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_POLICIES, DEFAULT_SETTINGS, SEED_IDENTITIES } from "./seed";
import type { AuditEntry, Identity, PolicySet, Settings } from "./types";
import { uid } from "./utils";

type AppState = {
  identities: Identity[];
  policies: PolicySet;
  settings: Settings;
  audit: AuditEntry[];
  addIdentity: (identity: Omit<Identity, "id" | "sid" | "lastHibpCheck" | "breaches" | "hibpStatus"> & Partial<Identity>) => void;
  updateIdentity: (id: string, patch: Partial<Identity>) => void;
  removeIdentity: (id: string) => void;
  setPolicies: (policies: PolicySet) => void;
  setSettings: (patch: Partial<Settings>) => void;
  pushAudit: (entry: Omit<AuditEntry, "id" | "at"> & Partial<Pick<AuditEntry, "id" | "at">>) => void;
  clearAudit: () => void;
  resetDemo: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      identities: SEED_IDENTITIES,
      policies: DEFAULT_POLICIES,
      settings: DEFAULT_SETTINGS,
      audit: [],
      addIdentity: (identity) =>
        set((s) => ({
          identities: [
            {
              ...identity,
              id: uid("u"),
              hibpStatus: identity.hibpStatus ?? "unknown",
              breaches: identity.breaches ?? [],
              lastHibpCheck: identity.lastHibpCheck ?? null,
              sid:
                identity.sid ??
                `S-1-5-21-1847362910-3928471023-1102948576-${1000 + s.identities.length}`,
              knownPwned: identity.knownPwned ?? false,
              enabled: identity.enabled ?? true,
              lastPasswordSet: identity.lastPasswordSet ?? new Date().toISOString(),
            },
            ...s.identities,
          ],
        })),
      updateIdentity: (id, patch) =>
        set((s) => ({
          identities: s.identities.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      removeIdentity: (id) =>
        set((s) => ({ identities: s.identities.filter((i) => i.id !== id) })),
      setPolicies: (policies) => set({ policies }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      pushAudit: (entry) =>
        set((s) => ({
          audit: [
            {
              id: uid("aud"),
              at: new Date().toISOString(),
              ...entry,
            },
            ...s.audit,
          ].slice(0, 200),
        })),
      clearAudit: () => set({ audit: [] }),
      resetDemo: () =>
        set({
          identities: SEED_IDENTITIES,
          policies: DEFAULT_POLICIES,
          settings: DEFAULT_SETTINGS,
          audit: [],
        }),
    }),
    {
      name: "pwnwaechter-dc",
      version: 1,
      skipHydration: true,
    },
  ),
);
