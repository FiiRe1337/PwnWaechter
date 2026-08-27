import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { f as LoaderCircle, g as EyeOff, h as Eye, p as KeyRound, s as ShieldAlert, t as X, u as Minus, v as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Badge, n as useAppStore, o as Button, s as cn } from "./router-Cd8d3wQ-.mjs";
import { n as CardInner, r as PageHeader, t as Card } from "./card-DJU3kCz1.mjs";
import { n as VerdictBadge, t as HibpStatusBadge } from "./status-badge-BEr50UlP.mjs";
import { n as Label, t as Input } from "./label-Cp3Rl2wU.mjs";
import { a as localPasswordHits, c as sha1Hex, i as localIdentityMatch, n as identityNeedles, o as lookupBreachedAccount, r as localBreachesFor, s as parseRangeBody, t as fetchPwnedRange } from "./hibp-CpBlPQjL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gate-CGS3qhgM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		id: "resolve",
		label: "Identität auflösen",
		hint: "sAMAccountName · UPN · SID"
	},
	{
		id: "hibp-identity",
		label: "Name in Have I Been Pwned",
		hint: "Konto / Mail gegen Leak-Katalog"
	},
	{
		id: "elevate",
		label: "Richtlinie anpassen",
		hint: "Basis oder erhöht (PSO)"
	},
	{
		id: "policy",
		label: "Passwort gegen Richtlinie",
		hint: "Länge, Klassen, Name, Wörterbuch"
	},
	{
		id: "pwned-password",
		label: "Pwned Passwords",
		hint: "SHA-1 k-Anonymität, Range-API"
	},
	{
		id: "decide",
		label: "Entscheidung",
		hint: "LSA Password Filter Rückgabe"
	}
];
var ORDER = STEPS.map((s) => s.id);
function rank(step) {
	return ORDER.indexOf(step);
}
function GatePipeline({ current, identityPwned, verdict }) {
	const currentRank = rank(current);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-0",
		children: STEPS.map((step, i) => {
			const done = current !== "idle" && i < currentRank;
			const active = current === step.id;
			const failed = step.id === "hibp-identity" && done && identityPwned || step.id === "decide" && verdict === "deny";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex size-7 items-center justify-center rounded-full text-[0.6875rem] font-medium transition-colors duration-200", active && "bg-steel text-steel-fg", done && !failed && "bg-ok/20 text-ok", done && failed && "bg-danger/20 text-danger", !active && !done && "bg-elevated text-subtle"),
						children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : done && failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }) : done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : i + 1
					}), i < STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("w-px flex-1 bg-line", done && "bg-ok/30") }) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("pb-5", i === STEPS.length - 1 && "pb-0"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("text-sm", active || done ? "text-fg" : "text-muted"),
						children: step.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: step.hint
					})]
				})]
			}, step.id);
		})
	});
}
function Row({ ok, label, hint, pending }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-start gap-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", pending ? "bg-elevated text-muted" : ok ? "bg-ok/15 text-ok" : ok === false ? "bg-danger/15 text-danger" : "bg-elevated text-muted"),
			children: pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3" }) : ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : ok === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm",
				children: label
			}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs text-muted",
				children: hint
			}) : null]
		})]
	});
}
function PolicyRequirementList({ policy, mode }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "divide-y divide-line",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: `Mindestens ${policy.minLength} Zeichen` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: `${policy.minClasses} Zeichenklassen (klein / groß / Ziffer / Sonder)` }),
			policy.requireSpecial ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: "Sonderzeichen Pflicht" }) : null,
			policy.banUsername ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: "Kein Kontoname im Passwort" }) : null,
			policy.banDisplayName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: "Kein Vor- oder Nachname im Passwort" }) : null,
			policy.banPwnedPasswords ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: "Nicht in Have I Been Pwned (Passwörter)" }) : null,
			policy.banKeyboardWalks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: "Keine QWERTZ-Folgen" }) : null,
			policy.banRepeats ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: "Keine dreifache Zeichenwiederholung" }) : null,
			policy.banCommonWords ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { label: "Keine Wörterbuchwörter" }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: `Gültigkeit ${policy.maxAgeDays} Tage · Verlauf ${policy.historyCount}`,
				hint: mode === "elevated" ? "Erhöhte Richtlinie für kompromittierte Identität" : "Standardrichtlinie der Domäne"
			})
		]
	});
}
function LiveCheckList({ checks }) {
	if (checks.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-6 text-sm text-muted",
		children: "Passwort eingeben, um die Prüfung zu sehen."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-line",
		children: checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			ok: c.passed,
			label: c.label,
			hint: c.detail
		}, c.code))
	});
}
var SPECIAL = /[^A-Za-z0-9]/;
var WALKS = [
	"qwertz",
	"qwerty",
	"asdfgh",
	"yxcvbn",
	"12345",
	"123456",
	"09876",
	"1qay2wsx",
	"qaywsx",
	"abcdef"
];
var COMMON_WORDS = [
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
	"sterne"
];
function classesOf(pw) {
	let n = 0;
	if (/[a-z]/.test(pw)) n += 1;
	if (/[A-Z]/.test(pw)) n += 1;
	if (/\d/.test(pw)) n += 1;
	if (SPECIAL.test(pw)) n += 1;
	return n;
}
function uniqueChars(pw) {
	return (/* @__PURE__ */ new Set([...pw])).size;
}
function hasWalk(pw) {
	const lower = pw.toLowerCase();
	return WALKS.some((w) => lower.includes(w));
}
function hasRepeatRun(pw) {
	return /(.)\1{2,}/.test(pw);
}
function containsAny(haystack, needles) {
	const h = haystack.toLowerCase();
	return needles.map((n) => n.toLowerCase()).filter((n) => n.length >= 3).some((n) => h.includes(n));
}
function hasCommonWord(pw) {
	const lower = pw.toLowerCase();
	return COMMON_WORDS.some((w) => lower.includes(w));
}
function policyModeFor(identity, autoElevate) {
	if (!autoElevate) return "baseline";
	if (identity.hibpStatus === "pwned") return "elevated";
	if (identity.knownPwned) return "elevated";
	return "baseline";
}
function evaluatePassword(opts) {
	const { password, identity, policy, mode, pwnedHits, hibpReachable } = opts;
	const elevated = mode === "elevated";
	const results = [];
	results.push({
		code: "length",
		label: `Mindestlänge ${policy.minLength}`,
		detail: `${password.length} / ${policy.minLength} Zeichen`,
		passed: password.length >= policy.minLength
	});
	results.push({
		code: "classes",
		label: `${policy.minClasses} Zeichenklassen`,
		detail: `${classesOf(password)} von 4 (klein, groß, Ziffer, Sonderzeichen)`,
		passed: classesOf(password) >= policy.minClasses
	});
	if (policy.requireUpper) results.push({
		code: "upper",
		label: "Großbuchstabe",
		detail: "Mindestens ein A–Z",
		passed: /[A-Z]/.test(password)
	});
	if (policy.requireLower) results.push({
		code: "lower",
		label: "Kleinbuchstabe",
		detail: "Mindestens ein a–z",
		passed: /[a-z]/.test(password)
	});
	if (policy.requireDigit) results.push({
		code: "digit",
		label: "Ziffer",
		detail: "Mindestens eine 0–9",
		passed: /\d/.test(password)
	});
	if (policy.requireSpecial) results.push({
		code: "special",
		label: "Sonderzeichen",
		detail: "Mindestens ein nicht-alphanumerisches Zeichen",
		passed: SPECIAL.test(password),
		elevatedOnly: elevated && policy.requireSpecial
	});
	results.push({
		code: "unique",
		label: `${policy.minUniqueChars} unterschiedliche Zeichen`,
		detail: `${uniqueChars(password)} einzigartige Zeichen`,
		passed: uniqueChars(password) >= policy.minUniqueChars
	});
	if (policy.banUsername) {
		const hit = containsAny(password, [
			identity.sam,
			identity.upn.split("@")[0] ?? "",
			identity.mail.split("@")[0] ?? ""
		]);
		results.push({
			code: "username",
			label: "Kein Kontoname im Passwort",
			detail: hit ? "Enthält sAMAccountName oder UPN-Präfix" : "Kontoname nicht enthalten",
			passed: !hit
		});
	}
	if (policy.banDisplayName) {
		const hit = containsAny(password, [
			identity.givenName,
			identity.surname,
			identity.displayName
		]);
		results.push({
			code: "displayname",
			label: "Kein Anzeigename im Passwort",
			detail: hit ? "Enthält Vor- oder Nachnamen" : "Name nicht enthalten",
			passed: !hit
		});
	}
	if (policy.banKeyboardWalks) {
		const hit = hasWalk(password);
		results.push({
			code: "walk",
			label: "Keine Tastaturfolgen",
			detail: hit ? "QWERTZ-/Zahlenfolge erkannt" : "Keine Walks",
			passed: !hit,
			elevatedOnly: true
		});
	}
	if (policy.banRepeats) {
		const hit = hasRepeatRun(password);
		results.push({
			code: "repeat",
			label: "Keine Zeichenwiederholung",
			detail: hit ? "Drei gleiche Zeichen hintereinander" : "Keine Runs",
			passed: !hit,
			elevatedOnly: true
		});
	}
	if (policy.banCommonWords) {
		const hit = hasCommonWord(password);
		results.push({
			code: "common",
			label: "Keine Wörterbuchwörter",
			detail: hit ? "Enthält häufiges deutsches/englisches Wort" : "Kein Treffer im Katalog",
			passed: !hit,
			elevatedOnly: true
		});
	}
	if (policy.banPwnedPasswords) {
		if (pwnedHits === null) results.push({
			code: "hibp-pw",
			label: "Nicht in Pwned Passwords",
			detail: hibpReachable ? "Prüfung steht aus" : "HIBP nicht erreichbar — lokaler Katalog genutzt",
			passed: true
		});
		else if (pwnedHits > 0) results.push({
			code: "hibp-pw",
			label: "Nicht in Pwned Passwords",
			detail: `${pwnedHits.toLocaleString("de-DE")} mal in öffentlichen Leaks gesehen`,
			passed: false
		});
		else results.push({
			code: "hibp-pw",
			label: "Nicht in Pwned Passwords",
			detail: "SHA-1-Bereich ohne Treffer (k-Anonymität)",
			passed: true
		});
	}
	return results;
}
function allPassed(checks) {
	return checks.every((c) => c.passed);
}
function strengthScore(password, checks) {
	if (!password) return 0;
	const ratio = checks.filter((c) => c.passed).length / Math.max(checks.length, 1);
	const lengthBonus = Math.min(password.length / 24, 1) * .15;
	return Math.round(Math.min(1, ratio * .85 + lengthBonus) * 100);
}
function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
function GatePage() {
	const identities = useAppStore((s) => s.identities);
	const policies = useAppStore((s) => s.policies);
	const settings = useAppStore((s) => s.settings);
	const updateIdentity = useAppStore((s) => s.updateIdentity);
	const pushAudit = useAppStore((s) => s.pushAudit);
	const enabled = identities.filter((i) => i.enabled);
	const [identityId, setIdentityId] = (0, import_react.useState)(enabled[0]?.id ?? "");
	const identity = identities.find((i) => i.id === identityId) ?? enabled[0];
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [show, setShow] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)("idle");
	const [verdict, setVerdict] = (0, import_react.useState)(null);
	const [finalChecks, setFinalChecks] = (0, import_react.useState)(null);
	const [pwnedHits, setPwnedHits] = (0, import_react.useState)(null);
	const [appliedMode, setAppliedMode] = (0, import_react.useState)(null);
	const [identityPwned, setIdentityPwned] = (0, import_react.useState)(null);
	const liveMode = identity ? policyModeFor(identity, settings.autoElevate) : "baseline";
	const livePolicy = policies[liveMode];
	const previewChecks = (0, import_react.useMemo)(() => {
		if (!identity || !password) return [];
		return evaluatePassword({
			password,
			identity,
			policy: livePolicy,
			mode: liveMode,
			pwnedHits: null,
			hibpReachable: true
		}).filter((c) => c.code !== "hibp-pw");
	}, [
		identity,
		password,
		livePolicy,
		liveMode
	]);
	const score = strengthScore(password, previewChecks);
	(0, import_react.useEffect)(() => {
		setVerdict(null);
		setFinalChecks(null);
		setPwnedHits(null);
		setAppliedMode(null);
		setIdentityPwned(null);
		setStep("idle");
		setPassword("");
		setConfirm("");
	}, [identityId]);
	async function runGate() {
		if (!identity) return;
		if (!settings.filterEnabled) {
			toast.error("Filter ist deaktiviert — Änderung würde ungeprüft durchgehen.");
			return;
		}
		if (!password) {
			toast.error("Neues Passwort fehlt.");
			return;
		}
		if (password !== confirm) {
			toast.error("Passwörter stimmen nicht überein.");
			return;
		}
		setBusy(true);
		setVerdict(null);
		setFinalChecks(null);
		try {
			setStep("resolve");
			await sleep(420);
			setStep("hibp-identity");
			const needles = identityNeedles(identity);
			let pwned = identity.hibpStatus === "pwned" || identity.knownPwned || localIdentityMatch(needles);
			let breaches = identity.breaches;
			if (settings.hibpApiKey) {
				const account = identity.mail || identity.upn;
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
				} else if (live.mode === "unauthorized") toast.error("HIBP-API-Schlüssel wurde abgelehnt.");
			} else if (!pwned) {
				const extra = localBreachesFor(needles);
				if (extra.length) {
					pwned = true;
					breaches = extra;
				}
			}
			updateIdentity(identity.id, {
				hibpStatus: pwned ? "pwned" : "clean",
				breaches,
				lastHibpCheck: (/* @__PURE__ */ new Date()).toISOString(),
				knownPwned: pwned
			});
			setIdentityPwned(pwned);
			await sleep(520);
			setStep("elevate");
			const mode = settings.autoElevate && pwned ? "elevated" : "baseline";
			const policy = policies[mode];
			setAppliedMode(mode);
			await sleep(480);
			setStep("policy");
			await sleep(360);
			setStep("pwned-password");
			let hits = 0;
			let hibpReachable = false;
			if (settings.checkPwnedPasswords && policy.banPwnedPasswords) {
				const localHits = localPasswordHits(password);
				hits = localHits;
				try {
					const hash = await sha1Hex(password);
					const prefix = hash.slice(0, 5);
					const suffix = hash.slice(5);
					const range = await fetchPwnedRange({ data: { prefix } });
					hits = Math.max(localHits, parseRangeBody(range.text, suffix));
					hibpReachable = true;
				} catch {
					hibpReachable = false;
					if (hits === 0) toast.message("HIBP nicht erreichbar — lokaler Notfallkatalog verwendet.");
				}
			}
			setPwnedHits(hits);
			await sleep(280);
			const checks = evaluatePassword({
				password,
				identity,
				policy,
				mode,
				pwnedHits: hits,
				hibpReachable
			});
			const mismatch = {
				code: "confirm",
				label: "Bestätigung identisch",
				detail: password === confirm ? "Felder stimmen überein" : "Weicht ab",
				passed: password === confirm
			};
			const all = [...checks, mismatch];
			const ok = allPassed(all);
			setFinalChecks(all);
			setStep("decide");
			await sleep(280);
			setVerdict(ok ? "allow" : "deny");
			pushAudit({
				identityId: identity.id,
				sam: identity.sam,
				displayName: identity.displayName,
				identityPwned: pwned,
				breachCount: breaches.length,
				policyApplied: mode,
				pwnedPasswordHits: hits,
				hibpReachable,
				verdict: ok ? "allow" : "deny",
				reasons: all.filter((c) => !c.passed).map((c) => c.label),
				checks: all
			});
			if (ok) {
				updateIdentity(identity.id, { lastPasswordSet: (/* @__PURE__ */ new Date()).toISOString() });
				toast.success("Passwortänderung zugelassen.");
			} else toast.error("Passwortänderung abgelehnt.");
		} finally {
			setBusy(false);
		}
	}
	if (!identity) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Keine aktivierten Identitäten."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "LSA Password Filter",
			title: "Passwortwechsel",
			description: "Wie auf dem Domain Controller: Zuerst wird der Name gegen Have I Been Pwned geprüft. Steht die Identität in einem Leak, gilt ab sofort die erhöhte Richtlinie — erst dann wird das neue Passwort bewertet."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-9 items-center justify-center rounded-sm bg-paper text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Sicherheitshinweis"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs text-muted",
					children: settings.dcName
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "identity",
								children: "Benutzerkonto"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: "identity",
								value: identity.id,
								onChange: (e) => setIdentityId(e.target.value),
								className: "flex h-11 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/50",
								children: enabled.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: i.id,
									children: [
										i.displayName,
										" (",
										i.sam,
										")"
									]
								}, i.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-subtle",
									children: identity.upn
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HibpStatusBadge, { status: liveMode === "elevated" ? "pwned" : identity.hibpStatus })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pw",
							children: "Neues Passwort"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pw",
								type: show ? "text" : "password",
								autoComplete: "new-password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "pr-12"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": show ? "Verbergen" : "Anzeigen",
								className: "absolute top-0 right-0 flex size-11 items-center justify-center text-muted hover:text-fg",
								onClick: () => setShow((v) => !v),
								children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pw2",
							children: "Bestätigung"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pw2",
							type: show ? "text" : "password",
							autoComplete: "new-password",
							value: confirm,
							onChange: (e) => setConfirm(e.target.value)
						})]
					}),
					password ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex justify-between text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stärke (vor HIBP-Passwortcheck)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [score, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 overflow-hidden rounded-full bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("h-full transition-[width] duration-200", score < 40 ? "bg-danger" : score < 75 ? "bg-warn" : "bg-ok"),
							style: { width: `${score}%` }
						})
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: busy,
						onClick: () => void runGate(),
						children: busy ? "Filter prüft…" : "Änderung an den DC senden"
					})
				]
			})] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Filter-Pipeline"
				}), verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict }) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GatePipeline, {
				current: step,
				identityPwned,
				verdict
			})] }) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Aktive Anforderung"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: liveMode === "elevated" ? "danger" : "steel",
						children: liveMode === "elevated" ? "erhöht · HIBP" : "Basis"
					})]
				}),
				liveMode === "elevated" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex gap-3 rounded-md bg-danger/10 px-3 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mt-0.5 size-4 shrink-0 text-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Der Name dieser Identität steht in Have I Been Pwned",
						identity.breaches.length ? ` (${identity.breaches.map((b) => b.name).join(", ")})` : "",
						". Die Passwortrichtlinie wurde für genau dieses Konto angehoben."
					] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-sm text-muted",
					children: "Kein Treffer im Identitätskatalog. Es gilt die Standardrichtlinie der Domäne — Pwned Passwords werden trotzdem gesperrt."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyRequirementList, {
					policy: livePolicy,
					mode: liveMode
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm font-medium",
					children: finalChecks ? "Ergebnis der Filterprüfung" : "Live-Prüfung"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveCheckList, { checks: finalChecks ?? previewChecks }),
				appliedMode && pwnedHits !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 font-mono text-xs text-subtle",
					children: [
						"Richtlinie ",
						appliedMode === "elevated" ? "erhöht" : "Basis",
						" · Pwned-Hits",
						" ",
						pwnedHits.toLocaleString("de-DE")
					]
				}) : null
			] }) })]
		})
	] });
}
//#endregion
export { GatePage as component };
