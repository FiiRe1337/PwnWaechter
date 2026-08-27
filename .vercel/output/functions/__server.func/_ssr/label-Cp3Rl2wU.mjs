import "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as cn } from "./router-Cd8d3wQ-.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle transition-[box-shadow] duration-150", "focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-steel/50", "disabled:opacity-40", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
//#endregion
export { Label as n, Input as t };
