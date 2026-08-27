import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Badge, n as useAppStore, o as Button, s as cn } from "./router-Cd8d3wQ-.mjs";
import { n as CardInner, r as PageHeader, t as Card } from "./card-DJU3kCz1.mjs";
import { n as Label, t as Input } from "./label-Cp3Rl2wU.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/policy-XG2cohXa.js
var import_jsx_runtime = require_jsx_runtime();
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex h-11 w-full touch-none items-center", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow rounded-full bg-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full rounded-full bg-steel" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-paper shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60" })]
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-elevated shadow-[var(--shadow-border)] transition-colors", "data-[state=checked]:bg-steel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-fg transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-steel-fg" })
	});
}
function PolicyPage() {
	const policies = useAppStore((s) => s.policies);
	const setPolicies = useAppStore((s) => s.setPolicies);
	const settings = useAppStore((s) => s.settings);
	const setSettings = useAppStore((s) => s.setSettings);
	const resetDemo = useAppStore((s) => s.resetDemo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Fine-Grained Password Policy",
			title: "Richtlinien",
			description: "Zwei Profile: Basis für saubere Konten, erhöht sobald der Name in Have I Been Pwned steht. Auf einem echten DC entspricht das einer PSO auf der Gruppe PwnWaechter-Pwned.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => {
					resetDemo();
					toast.message("Demo zurückgesetzt.");
				},
				children: "Demo zurücksetzen"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm font-medium",
				children: "Filter auf dem DC"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
						label: "Password Filter aktiv",
						hint: "Ohne Filter ginge jede Änderung ungeprüft durch.",
						checked: settings.filterEnabled,
						onCheckedChange: (v) => setSettings({ filterEnabled: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
						label: "Richtlinie automatisch anheben",
						hint: "Name in HIBP → PSO-Profil „erhöht“ für genau dieses Konto.",
						checked: settings.autoElevate,
						onCheckedChange: (v) => setSettings({ autoElevate: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
						label: "Pwned Passwords prüfen",
						hint: "SHA-1 k-Anonymität gegen api.pwnedpasswords.com, niemals das Klartext-Passwort senden.",
						checked: settings.checkPwnedPasswords,
						onCheckedChange: (v) => setSettings({ checkPwnedPasswords: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "hibp-key",
								children: "HIBP-API-Schlüssel (optional)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "hibp-key",
								type: "password",
								autoComplete: "off",
								placeholder: "Ohne Schlüssel: lokaler Leak-Katalog",
								value: settings.hibpApiKey,
								onChange: (e) => setSettings({ hibpApiKey: e.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: "Nur für die Konto-API (Name in Leaks). Pwned Passwords braucht keinen Schlüssel. Der Wert bleibt im Browser, geht nicht in ein Repo."
							})
						]
					})
				]
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyEditor, {
				title: "Basis",
				badge: "saubere Identität",
				profile: policies.baseline,
				onChange: (baseline) => setPolicies({
					...policies,
					baseline
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyEditor, {
				title: "Erhöht",
				badge: "Name in HIBP",
				danger: true,
				profile: policies.elevated,
				onChange: (elevated) => setPolicies({
					...policies,
					elevated
				})
			})]
		})
	] });
}
function PolicyEditor({ title, badge, danger, profile, onChange }) {
	const patch = (p) => onChange({
		...profile,
		...p
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 flex items-center justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: danger ? "danger" : "steel",
			children: badge
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberRow, {
				label: "Mindestlänge",
				value: profile.minLength,
				min: 8,
				max: 32,
				onChange: (minLength) => patch({ minLength })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberRow, {
				label: "Zeichenklassen",
				value: profile.minClasses,
				min: 2,
				max: 4,
				onChange: (minClasses) => patch({ minClasses })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberRow, {
				label: "Unterschiedliche Zeichen",
				value: profile.minUniqueChars,
				min: 4,
				max: 24,
				onChange: (minUniqueChars) => patch({ minUniqueChars })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberRow, {
				label: "Max. Alter (Tage)",
				value: profile.maxAgeDays,
				min: 7,
				max: 365,
				onChange: (maxAgeDays) => patch({ maxAgeDays })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
				label: "Sonderzeichen Pflicht",
				checked: profile.requireSpecial,
				onCheckedChange: (requireSpecial) => patch({ requireSpecial })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
				label: "Kein Kontoname",
				checked: profile.banUsername,
				onCheckedChange: (banUsername) => patch({ banUsername })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
				label: "Kein Anzeigename",
				checked: profile.banDisplayName,
				onCheckedChange: (banDisplayName) => patch({ banDisplayName })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
				label: "Tastaturfolgen sperren",
				checked: profile.banKeyboardWalks,
				onCheckedChange: (banKeyboardWalks) => patch({ banKeyboardWalks })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSwitch, {
				label: "Wörterbuchwörter sperren",
				checked: profile.banCommonWords,
				onCheckedChange: (banCommonWords) => patch({ banCommonWords })
			})
		]
	})] }) });
}
function NumberRow({ label, value, min, max, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1 flex items-center justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono tabular-nums text-muted",
			children: value
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
		value: [value],
		min,
		max,
		step: 1,
		onValueChange: ([v]) => onChange(v ?? value)
	})] });
}
function RowSwitch({ label, hint, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: label
			}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: hint
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange
		})]
	});
}
//#endregion
export { PolicyPage as component };
