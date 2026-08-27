import "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as cn } from "./router-Cd8d3wQ-.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ kicker, title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 font-mono text-[0.6875rem] tracking-widest text-steel uppercase",
					children: kicker
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight md:text-3xl",
					children: title
				}),
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: description
				}) : null
			]
		}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: actions
		}) : null]
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]", className),
		...props
	});
}
function CardInner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-lg bg-elevated/40 p-4 md:p-5", className),
		...props
	});
}
//#endregion
export { CardInner as n, PageHeader as r, Card as t };
