import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Badge, c as formatDeDate, n as useAppStore, o as Button } from "./router-Cd8d3wQ-.mjs";
import { n as CardInner, r as PageHeader, t as Card } from "./card-DJU3kCz1.mjs";
import { n as VerdictBadge } from "./status-badge-BEr50UlP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-DmKkE0Zb.js
var import_jsx_runtime = require_jsx_runtime();
function AuditPage() {
	const audit = useAppStore((s) => s.audit);
	const clearAudit = useAppStore((s) => s.clearAudit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "Security Event Log",
		title: "Protokoll",
		description: "Jede Entscheidung des Filters: ob der Name in Have I Been Pwned stand, welches Profil galt, und warum zugelassen oder abgelehnt wurde.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: clearAudit,
			disabled: audit.length === 0,
			children: "Leeren"
		})
	}), audit.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardInner, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Noch keine Ereignisse. Ein Passwortwechsel schreibt den ersten Eintrag."
	}) }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: audit.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: a.displayName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs text-muted",
					children: a.sam
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						a.identityPwned ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "danger",
							children: [
								"Name in HIBP · ",
								a.breachCount,
								" Leaks"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "ok",
							children: "Name sauber"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: a.policyApplied === "elevated" ? "warn" : "steel",
							children: a.policyApplied === "elevated" ? "erhöht" : "Basis"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict: a.verdict })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-subtle",
				children: formatDeDate(a.at)
			}),
			a.pwnedPasswordHits !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-muted",
				children: [
					"Pwned Passwords: ",
					a.pwnedPasswordHits.toLocaleString("de-DE"),
					" Treffer",
					a.hibpReachable ? "" : " (lokaler Katalog)"
				]
			}) : null,
			a.reasons.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-wrap gap-2",
				children: a.reasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "danger",
					children: r
				}) }, r))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-ok",
				children: "Alle Regeln erfüllt."
			})
		] }) }, a.id))
	})] });
}
//#endregion
export { AuditPage as component };
