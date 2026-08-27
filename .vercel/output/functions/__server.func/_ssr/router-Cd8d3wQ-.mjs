import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, r as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { _ as createRootRoute, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SlidersHorizontal, b as Activity, d as Menu, m as FileText, n as Users, o as Shield, p as KeyRound, r as TriangleAlert, t as X } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { a as DialogOverlay, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as Provider } from "../_libs/radix-ui__react-tooltip.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-DJfVnIEI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
function formatDeDate(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return new Intl.DateTimeFormat("de-DE", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(d);
}
function formatRelativeDe(iso, now = Date.now()) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	const diff = now - d.getTime();
	const mins = Math.round(diff / 6e4);
	if (mins < 1) return "gerade eben";
	if (mins < 60) return `vor ${mins} Min.`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `vor ${hours} Std.`;
	const days = Math.round(hours / 24);
	if (days < 0) return "gerade eben";
	return `vor ${days} Tag${days === 1 ? "" : "en"}`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4", {
	variants: {
		variant: {
			default: "bg-paper text-ink hover:opacity-90 active:scale-[0.96]",
			steel: "bg-steel text-steel-fg hover:opacity-90 active:scale-[0.96]",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]",
			ghost: "text-muted hover:text-fg hover:bg-elevated active:scale-[0.96]",
			danger: "bg-danger text-fg hover:opacity-90 active:scale-[0.96]"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-[0.8125rem]",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-Cd8d3wQ-.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-medium",
				children: "Etwas ist schiefgelaufen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: error.message || "Unerwarteter Fehler. Seite neu laden."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var TooltipProvider = Provider;
var badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-elevated text-muted",
		steel: "bg-steel/15 text-steel",
		ok: "bg-ok/15 text-ok",
		warn: "bg-warn/15 text-warn",
		danger: "bg-danger/15 text-danger",
		paper: "bg-paper/10 text-fg"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Sheet = Dialog;
function SheetContent({ className, children, side = "left", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed top-0 z-50 flex h-full w-[min(88vw,280px)] flex-col bg-surface p-2 shadow-[var(--shadow-border)]", side === "left" ? "left-0" : "right-0", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
			className: "sr-only",
			children: "Navigation"
		}), children]
	})] });
}
var T0 = Date.parse("2026-08-26T08:00:00.000Z");
var daysAgo = (n) => (/* @__PURE__ */ new Date(T0 - n * 24 * 60 * 60 * 1e3)).toISOString();
function sid(rid) {
	return `S-1-5-21-1847362910-3928471023-1102948576-${rid}`;
}
var FOREST = {
	domain: "adlerwerk.local",
	netbios: "ADLERWERK",
	dcName: "DC01.adlerwerk.local",
	forest: "adlerwerk.local",
	functionalLevel: "Windows Server 2016"
};
var DEFAULT_SETTINGS = {
	hibpApiKey: "",
	domain: FOREST.domain,
	dcName: FOREST.dcName,
	forest: FOREST.forest,
	filterEnabled: true,
	autoElevate: true,
	checkPwnedPasswords: true
};
var DEFAULT_POLICIES = {
	baseline: {
		minLength: 12,
		minClasses: 3,
		requireUpper: true,
		requireLower: true,
		requireDigit: true,
		requireSpecial: false,
		banUsername: true,
		banDisplayName: true,
		banPwnedPasswords: true,
		minUniqueChars: 8,
		maxAgeDays: 90,
		historyCount: 24,
		banKeyboardWalks: false,
		banRepeats: false,
		banCommonWords: false
	},
	elevated: {
		minLength: 16,
		minClasses: 4,
		requireUpper: true,
		requireLower: true,
		requireDigit: true,
		requireSpecial: true,
		banUsername: true,
		banDisplayName: true,
		banPwnedPasswords: true,
		minUniqueChars: 12,
		maxAgeDays: 30,
		historyCount: 24,
		banKeyboardWalks: true,
		banRepeats: true,
		banCommonWords: true
	}
};
var adobe = {
	name: "Adobe",
	domain: "adobe.com",
	breachDate: "2013-10-04",
	dataClasses: [
		"E-Mail",
		"Passwort",
		"Namen"
	]
};
var collection1 = {
	name: "Collection #1",
	domain: "",
	breachDate: "2019-01-07",
	dataClasses: ["E-Mail", "Passwort"]
};
var linkedin = {
	name: "LinkedIn",
	domain: "linkedin.com",
	breachDate: "2012-05-05",
	dataClasses: ["E-Mail", "Passwort"]
};
var dropbox = {
	name: "Dropbox",
	domain: "dropbox.com",
	breachDate: "2012-07-01",
	dataClasses: ["E-Mail", "Passwort"]
};
var canva = {
	name: "Canva",
	domain: "canva.com",
	breachDate: "2019-05-24",
	dataClasses: [
		"E-Mail",
		"Namen",
		"Passwort"
	]
};
var SEED_IDENTITIES = [
	{
		id: "u-anna",
		sam: "anna.weber",
		upn: "anna.weber@adlerwerk.local",
		mail: "anna.weber@adlerwerk.de",
		displayName: "Anna Weber",
		givenName: "Anna",
		surname: "Weber",
		department: "Finanzwesen",
		title: "Leiterin Controlling",
		enabled: true,
		lastPasswordSet: daysAgo(74),
		hibpStatus: "pwned",
		breaches: [
			adobe,
			collection1,
			linkedin
		],
		lastHibpCheck: daysAgo(0),
		sid: sid(1104),
		ou: "OU=Finanzwesen,DC=adlerwerk,DC=local",
		knownPwned: true
	},
	{
		id: "u-max",
		sam: "max.koenig",
		upn: "max.koenig@adlerwerk.local",
		mail: "max.koenig@adlerwerk.de",
		displayName: "Max König",
		givenName: "Max",
		surname: "König",
		department: "IT",
		title: "Systemadministrator",
		enabled: true,
		lastPasswordSet: daysAgo(18),
		hibpStatus: "clean",
		breaches: [],
		lastHibpCheck: daysAgo(0),
		sid: sid(1105),
		ou: "OU=IT,DC=adlerwerk,DC=local",
		knownPwned: false
	},
	{
		id: "u-lena",
		sam: "lena.hofmann",
		upn: "lena.hofmann@adlerwerk.local",
		mail: "lena.hofmann@adlerwerk.de",
		displayName: "Lena Hofmann",
		givenName: "Lena",
		surname: "Hofmann",
		department: "Vertrieb",
		title: "Key Account",
		enabled: true,
		lastPasswordSet: daysAgo(102),
		hibpStatus: "pwned",
		breaches: [collection1, canva],
		lastHibpCheck: daysAgo(0),
		sid: sid(1106),
		ou: "OU=Vertrieb,DC=adlerwerk,DC=local",
		knownPwned: true
	},
	{
		id: "u-klaus",
		sam: "klaus.becker",
		upn: "klaus.becker@adlerwerk.local",
		mail: "klaus.becker@adlerwerk.de",
		displayName: "Klaus Becker",
		givenName: "Klaus",
		surname: "Becker",
		department: "Produktion",
		title: "Meister Schicht A",
		enabled: true,
		lastPasswordSet: daysAgo(41),
		hibpStatus: "clean",
		breaches: [],
		lastHibpCheck: daysAgo(0),
		sid: sid(1107),
		ou: "OU=Produktion,DC=adlerwerk,DC=local",
		knownPwned: false
	},
	{
		id: "u-julia",
		sam: "julia.brandt",
		upn: "julia.brandt@adlerwerk.local",
		mail: "julia.brandt@adlerwerk.de",
		displayName: "Julia Brandt",
		givenName: "Julia",
		surname: "Brandt",
		department: "Geschäftsführung",
		title: "Geschäftsführerin",
		enabled: true,
		lastPasswordSet: daysAgo(11),
		hibpStatus: "pwned",
		breaches: [
			dropbox,
			{
				name: "Twitter",
				domain: "twitter.com",
				breachDate: "2021-01-01",
				dataClasses: ["E-Mail", "Namen"]
			},
			adobe
		],
		lastHibpCheck: daysAgo(0),
		sid: sid(1108),
		ou: "OU=Geschäftsführung,DC=adlerwerk,DC=local",
		knownPwned: true
	},
	{
		id: "u-ralf",
		sam: "ralf.stein",
		upn: "ralf.stein@adlerwerk.local",
		mail: "ralf.stein@adlerwerk.de",
		displayName: "Ralf Stein",
		givenName: "Ralf",
		surname: "Stein",
		department: "Service",
		title: "Field Engineer",
		enabled: true,
		lastPasswordSet: daysAgo(55),
		hibpStatus: "clean",
		breaches: [],
		lastHibpCheck: daysAgo(0),
		sid: sid(1109),
		ou: "OU=Service,DC=adlerwerk,DC=local",
		knownPwned: false
	},
	{
		id: "u-mira",
		sam: "mira.yilmaz",
		upn: "mira.yilmaz@adlerwerk.local",
		mail: "mira.yilmaz@adlerwerk.de",
		displayName: "Mira Yilmaz",
		givenName: "Mira",
		surname: "Yilmaz",
		department: "IT",
		title: "IAM-Ingenieurin",
		enabled: true,
		lastPasswordSet: daysAgo(7),
		hibpStatus: "clean",
		breaches: [],
		lastHibpCheck: daysAgo(0),
		sid: sid(1110),
		ou: "OU=IT,DC=adlerwerk,DC=local",
		knownPwned: false
	},
	{
		id: "u-tobias",
		sam: "tobias.klein",
		upn: "tobias.klein@adlerwerk.local",
		mail: "tobias.klein@adlerwerk.de",
		displayName: "Tobias Klein",
		givenName: "Tobias",
		surname: "Klein",
		department: "Vertrieb",
		title: "Innenvertrieb",
		enabled: true,
		lastPasswordSet: daysAgo(210),
		hibpStatus: "pwned",
		breaches: [collection1],
		lastHibpCheck: daysAgo(0),
		sid: sid(1111),
		ou: "OU=Vertrieb,DC=adlerwerk,DC=local",
		knownPwned: true
	},
	{
		id: "u-admin",
		sam: "adm.koenig",
		upn: "adm.koenig@adlerwerk.local",
		mail: "max.koenig@adlerwerk.de",
		displayName: "Max König (Admin)",
		givenName: "Max",
		surname: "König",
		department: "IT",
		title: "Domain-Admin",
		enabled: true,
		lastPasswordSet: daysAgo(29),
		hibpStatus: "watching",
		breaches: [],
		lastHibpCheck: daysAgo(0),
		sid: sid(512),
		ou: "OU=IT,DC=adlerwerk,DC=local",
		knownPwned: false
	},
	{
		id: "u-sofia",
		sam: "sofia.neri",
		upn: "sofia.neri@adlerwerk.local",
		mail: "sofia.neri@adlerwerk.de",
		displayName: "Sofia Neri",
		givenName: "Sofia",
		surname: "Neri",
		department: "Personal",
		title: "HR Business Partner",
		enabled: true,
		lastPasswordSet: daysAgo(63),
		hibpStatus: "pwned",
		breaches: [canva, linkedin],
		lastHibpCheck: daysAgo(0),
		sid: sid(1112),
		ou: "OU=Personal,DC=adlerwerk,DC=local",
		knownPwned: true
	},
	{
		id: "u-jan",
		sam: "jan.voigt",
		upn: "jan.voigt@adlerwerk.local",
		mail: "jan.voigt@adlerwerk.de",
		displayName: "Jan Voigt",
		givenName: "Jan",
		surname: "Voigt",
		department: "Produktion",
		title: "Qualitätsprüfer",
		enabled: false,
		lastPasswordSet: daysAgo(400),
		hibpStatus: "unknown",
		breaches: [],
		lastHibpCheck: null,
		sid: sid(1113),
		ou: "OU=Produktion,DC=adlerwerk,DC=local",
		knownPwned: false
	},
	{
		id: "u-emma",
		sam: "emma.scholz",
		upn: "emma.scholz@adlerwerk.local",
		mail: "emma.scholz@adlerwerk.de",
		displayName: "Emma Scholz",
		givenName: "Emma",
		surname: "Scholz",
		department: "Service",
		title: "Disponentin",
		enabled: true,
		lastPasswordSet: daysAgo(22),
		hibpStatus: "clean",
		breaches: [],
		lastHibpCheck: daysAgo(0),
		sid: sid(1114),
		ou: "OU=Service,DC=adlerwerk,DC=local",
		knownPwned: false
	}
];
/** Names/emails that the local HIBP cache treats as pwned (demo + common dumps). */
var LOCAL_PWNED_NAMES = new Set([
	"test@test.com",
	"test@example.com",
	"admin",
	"administrator",
	"root",
	"guest",
	"info",
	"webmaster",
	"anna.weber",
	"anna.weber@adlerwerk.de",
	"lena.hofmann",
	"lena.hofmann@adlerwerk.de",
	"julia.brandt",
	"julia.brandt@adlerwerk.de",
	"tobias.klein",
	"tobias.klein@adlerwerk.de",
	"sofia.neri",
	"sofia.neri@adlerwerk.de",
	"john@doe.com",
	"user@gmail.com"
].map((s) => s.toLowerCase()));
var LOCAL_BREACH_FALLBACK = [collection1, adobe];
var useAppStore = create()(persist((set) => ({
	identities: SEED_IDENTITIES,
	policies: DEFAULT_POLICIES,
	settings: DEFAULT_SETTINGS,
	audit: [],
	addIdentity: (identity) => set((s) => ({ identities: [{
		...identity,
		id: uid("u"),
		hibpStatus: identity.hibpStatus ?? "unknown",
		breaches: identity.breaches ?? [],
		lastHibpCheck: identity.lastHibpCheck ?? null,
		sid: identity.sid ?? `S-1-5-21-1847362910-3928471023-1102948576-${1e3 + s.identities.length}`,
		knownPwned: identity.knownPwned ?? false,
		enabled: identity.enabled ?? true,
		lastPasswordSet: identity.lastPasswordSet ?? (/* @__PURE__ */ new Date()).toISOString()
	}, ...s.identities] })),
	updateIdentity: (id, patch) => set((s) => ({ identities: s.identities.map((i) => i.id === id ? {
		...i,
		...patch
	} : i) })),
	removeIdentity: (id) => set((s) => ({ identities: s.identities.filter((i) => i.id !== id) })),
	setPolicies: (policies) => set({ policies }),
	setSettings: (patch) => set((s) => ({ settings: {
		...s.settings,
		...patch
	} })),
	pushAudit: (entry) => set((s) => ({ audit: [{
		id: uid("aud"),
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...entry
	}, ...s.audit].slice(0, 200) })),
	clearAudit: () => set({ audit: [] }),
	resetDemo: () => set({
		identities: SEED_IDENTITIES,
		policies: DEFAULT_POLICIES,
		settings: DEFAULT_SETTINGS,
		audit: []
	})
}), {
	name: "pwnwaechter-dc",
	version: 1,
	skipHydration: true
}));
var NAV = [
	{
		to: "/",
		label: "Übersicht",
		icon: Activity
	},
	{
		to: "/gate",
		label: "Passwortwechsel",
		icon: KeyRound
	},
	{
		to: "/identities",
		label: "Identitäten",
		icon: Users
	},
	{
		to: "/policy",
		label: "Richtlinien",
		icon: SlidersHorizontal
	},
	{
		to: "/audit",
		label: "Protokoll",
		icon: FileText
	},
	{
		to: "/deploy",
		label: "Bereitstellung",
		icon: Shield
	}
];
function NavLinks({ onNavigate }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-1",
		children: NAV.map((item) => {
			const active = pathname === item.to;
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: onNavigate,
				className: cn("flex h-11 items-center gap-3 rounded-sm px-3 text-sm transition-colors duration-150", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/60 hover:text-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), item.label]
			}, item.to);
		})
	});
}
function Brand() {
	const filterEnabled = useAppStore((s) => s.settings.filterEnabled);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-2 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-9 items-center justify-center rounded-sm bg-paper text-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
					className: "size-4",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-medium tracking-tight",
					children: "PwnWächter"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate font-mono text-[0.6875rem] text-muted",
					children: "DC-Passwortfilter"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: filterEnabled ? "ok" : "danger",
				className: "ml-auto",
				children: filterEnabled ? "aktiv" : "aus"
			})
		]
	});
}
function SidebarBody({ onNavigate }) {
	const settings = useAppStore((s) => s.settings);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex-1 px-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { onNavigate })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto border-t border-line px-3 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[0.6875rem] text-subtle",
					children: settings.dcName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 font-mono text-[0.6875rem] text-subtle",
					children: settings.domain
				})]
			})
		]
	});
}
function AppShell({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const settings = useAppStore((s) => s.settings);
	(0, import_react.useEffect)(() => {
		useAppStore.persist.rehydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-surface md:flex md:flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarBody, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur-sm md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Menü",
						onClick: () => setOpen(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 text-steel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: "PwnWächter"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "steel",
						className: "ml-auto truncate",
						children: settings.dcName
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end p-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Schließen",
							onClick: () => setOpen(false),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarBody, { onNavigate: () => setOpen(false) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "md:pl-60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8",
					children
				})
			})
		]
	});
}
var styles_default = "/assets/styles-W7PXwWqJ.css";
var APP_NAME = "PwnWächter";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0c0d0f"
			},
			{
				name: "description",
				content: "Passwortfilter für Domain Controller: prüft Identitäten gegen Have I Been Pwned und hebt die Passwortrichtlinie gezielt an."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "de",
		suppressHydrationWarning: true,
		className: "antialiased",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
				delayDuration: 250,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					theme: "dark",
					position: "bottom-right",
					toastOptions: { style: {
						background: "#1b1d22",
						border: "1px solid rgba(232,230,227,0.12)",
						color: "#e8e6e3"
					} }
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$5 = () => import("./routes-CevlvBXf.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./audit-DmKkE0Zb.mjs");
var Route$4 = createFileRoute("/audit")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./deploy-CWNo9PSs.mjs");
var Route$3 = createFileRoute("/deploy")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./gate-CGS3qhgM.mjs");
var Route$2 = createFileRoute("/gate")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./identities-BUreni9Q.mjs");
var Route$1 = createFileRoute("/identities")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./policy-XG2cohXa.mjs");
var Route = createFileRoute("/policy")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	AuditRoute: Route$4.update({
		id: "/audit",
		path: "/audit",
		getParentRoute: () => Route$6
	}),
	DeployRoute: Route$3.update({
		id: "/deploy",
		path: "/deploy",
		getParentRoute: () => Route$6
	}),
	GateRoute: Route$2.update({
		id: "/gate",
		path: "/gate",
		getParentRoute: () => Route$6
	}),
	IdentitiesRoute: Route$1.update({
		id: "/identities",
		path: "/identities",
		getParentRoute: () => Route$6
	}),
	PolicyRoute: Route.update({
		id: "/policy",
		path: "/policy",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Badge as a, formatDeDate as c, LOCAL_PWNED_NAMES as i, formatRelativeDe as l, useAppStore as n, Button as o, LOCAL_BREACH_FALLBACK as r, cn as s, router_exports as t };
