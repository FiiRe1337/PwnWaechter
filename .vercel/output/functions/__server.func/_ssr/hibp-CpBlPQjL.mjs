import { i as LOCAL_PWNED_NAMES, r as LOCAL_BREACH_FALLBACK } from "./router-Cd8d3wQ-.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hibp-CpBlPQjL.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var fetchPwnedRange = createServerFn({ method: "POST" }).validator((d) => {
	if (typeof d?.prefix !== "string" || !/^[0-9A-Fa-f]{5}$/.test(d.prefix)) throw new Error("Ungültiges SHA-1-Präfix");
	return { prefix: d.prefix.toUpperCase() };
}).handler(createSsrRpc("d9f38268cbd7e440e973d54135492e279a4eadfb3fb8ebfdb1bd30c5eed7bcf1"));
var lookupBreachedAccount = createServerFn({ method: "POST" }).validator((d) => {
	if (typeof d?.account !== "string" || d.account.trim().length < 3) throw new Error("Konto fehlt");
	return {
		account: d.account.trim(),
		apiKey: (d.apiKey ?? "").trim()
	};
}).handler(createSsrRpc("5c6f0cfb9eb6438d3bea40a1cd9a10b2e499c001974ba612cbe49f1c531af395"));
var LOCAL_COMMON_PASSWORDS = new Set([
	"password",
	"password1",
	"password123",
	"passwort",
	"passwort1",
	"passwort123",
	"123456",
	"12345678",
	"123456789",
	"1234567890",
	"qwerty",
	"qwertz",
	"qwertz123",
	"abc123",
	"admin",
	"admin123",
	"welcome",
	"welcome1",
	"letmein",
	"monkey",
	"dragon",
	"master",
	"login",
	"p@ssw0rd",
	"p@ssword",
	"passw0rd",
	"adlerwerk",
	"adlerwerk1",
	"adlerwerk2024",
	"adlerwerk2025",
	"adlerwerk2026",
	"sommer2024",
	"sommer2025",
	"winter2024",
	"winter2025",
	"hallo123",
	"hallo1234",
	"changeme",
	"secret",
	"iloveyou",
	"fussball",
	"deutschland",
	"schatz123"
].map((s) => s.toLowerCase()));
async function sha1Hex(text) {
	const data = new TextEncoder().encode(text);
	const buf = await crypto.subtle.digest("SHA-1", data);
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function parseRangeBody(body, suffix) {
	const target = suffix.toUpperCase();
	for (const line of body.split(/\r?\n/)) {
		if (!line) continue;
		const [hash, count] = line.split(":");
		if (hash?.toUpperCase() === target) {
			const n = Number.parseInt(count ?? "0", 10);
			return Number.isFinite(n) ? n : 0;
		}
	}
	return 0;
}
function localPasswordHits(password) {
	return LOCAL_COMMON_PASSWORDS.has(password.toLowerCase()) ? 1e6 : 0;
}
function identityNeedles(identity) {
	return [
		identity.sam,
		identity.upn,
		identity.mail,
		identity.displayName
	].map((s) => s.trim().toLowerCase()).filter(Boolean);
}
function localIdentityMatch(needles) {
	return needles.some((n) => LOCAL_PWNED_NAMES.has(n) || LOCAL_PWNED_NAMES.has(n.split("@")[0] ?? ""));
}
function localBreachesFor(needles) {
	if (!localIdentityMatch(needles)) return [];
	return LOCAL_BREACH_FALLBACK;
}
//#endregion
export { localPasswordHits as a, sha1Hex as c, localIdentityMatch as i, identityNeedles as n, lookupBreachedAccount as o, localBreachesFor as r, parseRangeBody as s, fetchPwnedRange as t };
