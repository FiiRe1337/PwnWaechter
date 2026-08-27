import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as RefreshCw, i as Trash2, l as Plus, t as X } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Badge, c as formatDeDate, n as useAppStore, o as Button, s as cn } from "./router-Cd8d3wQ-.mjs";
import { n as CardInner, r as PageHeader, t as Card } from "./card-DJU3kCz1.mjs";
import { t as HibpStatusBadge } from "./status-badge-BEr50UlP.mjs";
import { n as Label, t as Input } from "./label-Cp3Rl2wU.mjs";
import { i as localIdentityMatch, n as identityNeedles, o as lookupBreachedAccount, r as localBreachesFor } from "./hibp-CpBlPQjL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/identities-BUreni9Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-in" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]", "focus:outline-none", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative rounded-lg bg-elevated/50 p-5",
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
				className: "absolute top-3 right-3 size-11 rounded-sm text-muted hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Schließen"
				})]
			})]
		})
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("pr-8 text-base font-medium", className),
		...props
	});
}
function DialogDesc({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
		className: cn("mt-1 text-sm text-muted", className),
		...props
	});
}
function IdentitiesPage() {
	const identities = useAppStore((s) => s.identities);
	const settings = useAppStore((s) => s.settings);
	const addIdentity = useAppStore((s) => s.addIdentity);
	const updateIdentity = useAppStore((s) => s.updateIdentity);
	const removeIdentity = useAppStore((s) => s.removeIdentity);
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		displayName: "",
		sam: "",
		mail: "",
		department: "IT"
	});
	const filtered = (0, import_react.useMemo)(() => {
		const s = q.trim().toLowerCase();
		if (!s) return identities;
		return identities.filter((i) => [
			i.displayName,
			i.sam,
			i.mail,
			i.upn,
			i.department
		].some((v) => v.toLowerCase().includes(s)));
	}, [identities, q]);
	async function syncAll() {
		setSyncing(true);
		let marked = 0;
		try {
			for (const identity of identities) {
				const needles = identityNeedles(identity);
				let pwned = identity.knownPwned || localIdentityMatch(needles);
				let breaches = identity.breaches;
				if (settings.hibpApiKey) {
					const account = identity.mail || identity.upn;
					try {
						const live = await lookupBreachedAccount({ data: {
							account,
							apiKey: settings.hibpApiKey
						} });
						if (live.mode === "live") {
							pwned = live.breaches.length > 0;
							breaches = live.breaches.map((b) => ({
								name: b.Name,
								domain: b.Domain,
								breachDate: b.BreachDate,
								dataClasses: b.DataClasses ?? []
							}));
						}
					} catch {}
				} else if (pwned && breaches.length === 0) breaches = localBreachesFor(needles);
				updateIdentity(identity.id, {
					hibpStatus: pwned ? "pwned" : "clean",
					knownPwned: pwned,
					breaches,
					lastHibpCheck: (/* @__PURE__ */ new Date()).toISOString()
				});
				if (pwned) marked += 1;
			}
			toast.success(settings.hibpApiKey ? `HIBP-Abgleich fertig. ${marked} Identitäten in Leaks.` : `Lokaler Katalog abgeglichen. ${marked} Identitäten markiert.`);
		} finally {
			setSyncing(false);
		}
	}
	function submitNew() {
		if (!form.displayName.trim() || !form.sam.trim()) {
			toast.error("Name und sAMAccountName sind Pflicht.");
			return;
		}
		const sam = form.sam.trim().toLowerCase();
		const mail = form.mail.trim() || `${sam}@adlerwerk.de`;
		addIdentity({
			sam,
			upn: `${sam}@${settings.domain}`,
			mail,
			displayName: form.displayName.trim(),
			givenName: form.displayName.trim().split(" ")[0] ?? form.displayName,
			surname: form.displayName.trim().split(" ").slice(1).join(" ") || sam,
			department: form.department.trim() || "IT",
			title: "Benutzer",
			enabled: true,
			lastPasswordSet: (/* @__PURE__ */ new Date()).toISOString(),
			ou: `OU=${form.department || "IT"},DC=adlerwerk,DC=local`,
			knownPwned: localIdentityMatch([sam, mail]),
			hibpStatus: localIdentityMatch([sam, mail]) ? "pwned" : "unknown",
			breaches: localIdentityMatch([sam, mail]) ? localBreachesFor([sam, mail]) : []
		});
		setOpen(false);
		setForm({
			displayName: "",
			sam: "",
			mail: "",
			department: "IT"
		});
		toast.success("Konto angelegt.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Active Directory",
			title: "Identitäten",
			description: "Vor jedem Passwortwechsel prüft der Filter, ob sAMAccountName, UPN oder Mail in Have I Been Pwned stehen. Treffer landen in der Gruppe mit der erhöhten PSO.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				disabled: syncing,
				onClick: () => void syncAll(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${syncing ? "animate-spin" : ""}` }), "HIBP-Abgleich"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Konto"]
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardInner, {
				className: "p-3 md:p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Suchen nach Name, Mail, OU…",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [filtered.map((identity) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityCard, {
				identity,
				onRemove: () => removeIdentity(identity.id),
				onToggleFlag: () => updateIdentity(identity.id, {
					knownPwned: !identity.knownPwned,
					hibpStatus: !identity.knownPwned ? "pwned" : "clean",
					lastHibpCheck: (/* @__PURE__ */ new Date()).toISOString()
				})
			}, identity.id)), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted",
				children: "Keine Treffer."
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Konto anlegen" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDesc, { children: "Wird ins Verzeichnis aufgenommen und beim nächsten Wechsel gegen HIBP geprüft." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "dn",
								children: "Anzeigename"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "dn",
								value: form.displayName,
								onChange: (e) => setForm((f) => ({
									...f,
									displayName: e.target.value
								}))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "sam",
								children: "sAMAccountName"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "sam",
								value: form.sam,
								onChange: (e) => setForm((f) => ({
									...f,
									sam: e.target.value
								}))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "mail",
								children: "Mail"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "mail",
								value: form.mail,
								onChange: (e) => setForm((f) => ({
									...f,
									mail: e.target.value
								})),
								placeholder: "optional"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: submitNew,
							children: "Anlegen"
						})
					]
				})
			] })
		})
	] });
}
function IdentityCard({ identity, onRemove, onToggleFlag }) {
	const pwned = identity.hibpStatus === "pwned" || identity.knownPwned;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: identity.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HibpStatusBadge, { status: pwned ? "pwned" : identity.hibpStatus }),
							!identity.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "deaktiviert" }) : null,
							pwned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: "PSO erhöht"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs text-muted",
						children: [
							identity.sam,
							" · ",
							identity.mail
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-[0.6875rem] text-subtle",
						children: identity.ou
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: onToggleFlag,
					children: pwned ? "Als sauber markieren" : "Als HIBP markieren"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "Löschen",
					onClick: onRemove,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})]
			})]
		}),
		identity.breaches.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex flex-wrap gap-2",
			children: identity.breaches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "danger",
				children: [b.name, b.breachDate ? ` · ${b.breachDate.slice(0, 4)}` : ""]
			}) }, b.name))
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-xs text-subtle",
			children: [
				"Letzter HIBP-Check ",
				identity.lastHibpCheck ? formatDeDate(identity.lastHibpCheck) : "nie",
				" · Passwort gesetzt ",
				formatDeDate(identity.lastPasswordSet)
			]
		})
	] }) });
}
//#endregion
export { IdentitiesPage as component };
