window.ZTGYaml = (function () {
  function isPlainObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }

  function needsQuotes(s) {
    if (s === "") return true;
    if (/^[-:?|&*!>"'%@`{}[\],#]/.test(s)) return true;
    if (/^(true|false|null|yes|no|on|off)$/i.test(s)) return true;
    if (/^[-+]?[0-9]/.test(s) && /[eE.]/.test(s)) return true;
    if (/[:#{}[\],&*!|>'"%@`]/.test(s)) return true;
    if (/\n/.test(s)) return false;
    if (/^\s|\s$/.test(s)) return true;
    return false;
  }

  function quote(s) {
    return "'" + String(s).replace(/'/g, "''") + "'";
  }

  function dump(value, indent) {
    indent = indent || 0;
    const pad = "  ".repeat(indent);
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") {
      if (value.includes("\n")) {
        const lines = value.replace(/\n$/, "").split("\n");
        return "|\n" + lines.map((l) => pad + "  " + l).join("\n");
      }
      return needsQuotes(value) ? quote(value) : value;
    }
    if (Array.isArray(value)) {
      if (!value.length) return "[]";
      return value
        .map((item) => {
          if (isPlainObject(item)) {
            const keys = Object.keys(item);
            if (!keys.length) return pad + "- {}";
            const first = keys[0];
            const rest = keys.slice(1);
            let block = pad + "- " + first + ": " + formatInlineOrBlock(item[first], indent + 2, true);
            rest.forEach((k) => {
              block += "\n" + pad + "  " + k + ": " + formatInlineOrBlock(item[k], indent + 2, false);
            });
            return block;
          }
          return pad + "- " + dump(item, indent + 1);
        })
        .join("\n");
    }
    if (isPlainObject(value)) {
      const keys = Object.keys(value).filter((k) => {
        const v = value[k];
        if (v === undefined || v === null) return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      });
      if (!keys.length) return "{}";
      return keys
        .map((k) => pad + k + ": " + formatInlineOrBlock(value[k], indent + 1, false))
        .join("\n");
    }
    return quote(String(value));
  }

  function formatInlineOrBlock(val, indent, fromDash) {
    if (isPlainObject(val) || Array.isArray(val)) {
      const inner = dump(val, indent);
      if (inner === "{}" || inner === "[]") return inner;
      return "\n" + inner;
    }
    return dump(val, indent);
  }

  function document(obj) {
    return dump(obj, 0) + "\n";
  }

  return { dump: document };
})();
