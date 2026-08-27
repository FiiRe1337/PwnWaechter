import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Badge } from "./router-Cd8d3wQ-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-BEr50UlP.js
var import_jsx_runtime = require_jsx_runtime();
function HibpStatusBadge({ status }) {
	if (status === "pwned") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "danger",
		children: "in HIBP"
	});
	if (status === "clean") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "ok",
		children: "sauber"
	});
	if (status === "watching") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "warn",
		children: "beobachtet"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "ungeprüft" });
}
function VerdictBadge({ verdict }) {
	return verdict === "allow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "ok",
		children: "zugelassen"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "danger",
		children: "abgelehnt"
	});
}
//#endregion
export { VerdictBadge as n, HibpStatusBadge as t };
