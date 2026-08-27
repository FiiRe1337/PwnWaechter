import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hibp-fn-DXlQBNU_.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var fetchPwnedRange_createServerFn_handler = createServerRpc({
	id: "d9f38268cbd7e440e973d54135492e279a4eadfb3fb8ebfdb1bd30c5eed7bcf1",
	name: "fetchPwnedRange",
	filename: "src/lib/hibp-fn.ts"
}, (opts) => fetchPwnedRange.__executeServer(opts));
var fetchPwnedRange = createServerFn({ method: "POST" }).validator((d) => {
	if (typeof d?.prefix !== "string" || !/^[0-9A-Fa-f]{5}$/.test(d.prefix)) throw new Error("Ungültiges SHA-1-Präfix");
	return { prefix: d.prefix.toUpperCase() };
}).handler(fetchPwnedRange_createServerFn_handler, async ({ data }) => {
	const res = await fetch(`https://api.pwnedpasswords.com/range/${data.prefix}`, { headers: {
		"Add-Padding": "true",
		"User-Agent": "PwnWaechter-DC/1.0 (Active Directory password filter)"
	} });
	if (!res.ok) throw new Error(`Pwned Passwords antwortet ${res.status}`);
	return { text: await res.text() };
});
var lookupBreachedAccount_createServerFn_handler = createServerRpc({
	id: "5c6f0cfb9eb6438d3bea40a1cd9a10b2e499c001974ba612cbe49f1c531af395",
	name: "lookupBreachedAccount",
	filename: "src/lib/hibp-fn.ts"
}, (opts) => lookupBreachedAccount.__executeServer(opts));
var lookupBreachedAccount = createServerFn({ method: "POST" }).validator((d) => {
	if (typeof d?.account !== "string" || d.account.trim().length < 3) throw new Error("Konto fehlt");
	return {
		account: d.account.trim(),
		apiKey: (d.apiKey ?? "").trim()
	};
}).handler(lookupBreachedAccount_createServerFn_handler, async ({ data }) => {
	if (!data.apiKey) return { mode: "no-key" };
	const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(data.account)}?truncateResponse=false`;
	const res = await fetch(url, { headers: {
		"hibp-api-key": data.apiKey,
		"User-Agent": "PwnWaechter-DC/1.0 (Active Directory password filter)"
	} });
	if (res.status === 404) return {
		mode: "live",
		breaches: []
	};
	if (res.status === 401) return { mode: "unauthorized" };
	if (res.status === 429) return { mode: "ratelimit" };
	if (!res.ok) return {
		mode: "error",
		status: res.status
	};
	return {
		mode: "live",
		breaches: await res.json()
	};
});
//#endregion
export { fetchPwnedRange_createServerFn_handler, lookupBreachedAccount_createServerFn_handler };
