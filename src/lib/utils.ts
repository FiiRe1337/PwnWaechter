import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDeDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatRelativeDe(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = now - d.getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.round(hours / 24);
  if (days < 0) return "gerade eben";
  return `vor ${days} Tag${days === 1 ? "" : "en"}`;
}
