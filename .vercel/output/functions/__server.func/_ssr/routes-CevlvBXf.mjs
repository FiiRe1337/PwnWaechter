import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Users, p as KeyRound, s as ShieldAlert, y as ArrowRight } from "../_libs/lucide-react.mjs";
import { a as Badge, l as formatRelativeDe, n as useAppStore, o as Button } from "./router-Cd8d3wQ-.mjs";
import { n as CardInner, r as PageHeader, t as Card } from "./card-DJU3kCz1.mjs";
import { n as VerdictBadge } from "./status-badge-BEr50UlP.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CevlvBXf.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const identities = useAppStore((s) => s.identities);
	const audit = useAppStore((s) => s.audit);
	const settings = useAppStore((s) => s.settings);
	const policies = useAppStore((s) => s.policies);
	const pwned = identities.filter((i) => i.hibpStatus === "pwned" || i.knownPwned);
	const denied = audit.filter((a) => a.verdict === "deny");
	const chart = [
		{
			name: "Zugelassen",
			n: audit.filter((a) => a.verdict === "allow").length
		},
		{
			name: "Abgelehnt",
			n: denied.length
		},
		{
			name: "In HIBP",
			n: pwned.length
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: settings.dcName,
			title: "Domänenfilter",
			description: "PwnWächter sitzt vor der Passwortänderung. Steht der Name in Have I Been Pwned, gilt für genau dieses Konto die erhöhte Richtlinie.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/gate",
					children: ["Wechsel prüfen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Identitäten",
					value: identities.length,
					hint: "im Verzeichnis",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "In HIBP",
					value: pwned.length,
					hint: "erhöhte Richtlinie",
					warn: true,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Abgelehnt",
					value: denied.length,
					hint: "Filter-Verweigerungen",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Filter",
					value: settings.filterEnabled ? "aktiv" : "aus",
					hint: settings.autoElevate ? "Auto-Anhebung an" : "Auto-Anhebung aus"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-sm font-medium",
					children: "Richtlinien-Delta"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-5 text-sm text-muted",
					children: "Was sich ändert, sobald ein Name in Have I Been Pwned auftaucht."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 font-medium",
									children: "Regel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 font-medium",
									children: "Basis"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 font-medium",
									children: "Erhöht"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "[&_td]:py-2 [&_tr]:border-t [&_tr]:border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Mindestlänge" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "tabular-nums",
										children: policies.baseline.minLength
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "tabular-nums text-danger",
										children: policies.elevated.minLength
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Zeichenklassen" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "tabular-nums",
										children: policies.baseline.minClasses
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "tabular-nums text-danger",
										children: policies.elevated.minClasses
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Sonderzeichen" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: policies.baseline.requireSpecial ? "ja" : "nein" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "text-danger",
										children: policies.elevated.requireSpecial ? "ja" : "nein"
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Max. Alter" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "tabular-nums",
										children: [policies.baseline.maxAgeDays, " Tage"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "tabular-nums text-danger",
										children: [policies.elevated.maxAgeDays, " Tage"]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Pwned Passwords" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 2,
									children: "immer gesperrt"
								})] })
							]
						})]
					})
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, {
				className: "h-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-sm font-medium",
					children: "Aktivität"
				}), audit.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Noch keine Wechsel. Öffne Passwortwechsel und sende eine Änderung."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-48",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: chart,
							barSize: 28,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									tick: {
										fill: "#8b8d93",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { hide: true }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									cursor: { fill: "rgba(255,255,255,0.04)" },
									contentStyle: {
										background: "#1b1d22",
										border: "1px solid rgba(232,230,227,0.12)",
										borderRadius: 8,
										color: "#e8e6e3"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "n",
									fill: "#7a93a7",
									radius: [
										4,
										4,
										0,
										0
									]
								})
							]
						})
					})
				})]
			}) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Letzte Filterentscheidungen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/audit",
						children: "Protokoll"
					})
				})]
			}), audit.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Leer."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-line",
				children: audit.slice(0, 6).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-x-3 gap-y-2 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm",
								children: a.displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs text-subtle",
								children: a.sam
							})]
						}),
						a.identityPwned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "danger",
							children: "Name in HIBP"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "ok",
							children: "Name sauber"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict: a.verdict }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: formatRelativeDe(a.at)
						})
					]
				}, a.id))
			})] })
		})
	] });
}
function Stat({ label, value, hint, warn, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: warn ? "text-danger" : "text-muted",
				children: icon
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 font-mono text-2xl tabular-nums tracking-tight",
			children: value
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-subtle",
			children: hint
		})
	] }) });
}
//#endregion
export { Home as component };
