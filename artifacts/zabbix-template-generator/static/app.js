(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const state = {
    profile: "linux",
    modules: new Set(window.ZTG_PROFILES[0].modules),
    customItems: [],
    last: null
  };

  function renderModules() {
    const box = $("#modules");
    box.innerHTML = "";
    window.ZTG_CATALOG.forEach((m) => {
      const el = document.createElement("label");
      el.className = "mod" + (state.modules.has(m.id) ? " on" : "");
      el.innerHTML =
        '<input type="checkbox" ' + (state.modules.has(m.id) ? "checked" : "") + ">" +
        "<div><b>" + m.name + "</b><span>" + m.description + "</span></div>" +
        (m.lld ? '<div class="pill">LLD</div>' : "");
      el.querySelector("input").addEventListener("change", (e) => {
        if (e.target.checked) state.modules.add(m.id);
        else state.modules.delete(m.id);
        el.classList.toggle("on", e.target.checked);
        state.profile = "custom";
        markProfile();
      });
      box.appendChild(el);
    });
  }

  function markProfile() {
    $$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.id === state.profile));
  }

  function applyProfile(id) {
    const p = window.ZTG_PROFILES.find((x) => x.id === id);
    if (!p) return;
    state.profile = id;
    state.modules = new Set(p.modules);
    markProfile();
    renderModules();
  }

  function addCustomRow(data) {
    data = data || { name: "", command: "", value_type: "UNSIGNED", units: "", delay: "1m", trigger_expr: "" };
    state.customItems.push(data);
    renderCustom();
  }

  function renderCustom() {
    const box = $("#custom-list");
    box.innerHTML = "";
    state.customItems.forEach((row, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "custom-item";
      wrap.innerHTML =
        '<div class="row">' +
        '<div><label>Name</label><input data-k="name" type="text" placeholder="z. B. Redis connected clients"></div>' +
        '<div><label>Werttyp</label><select data-k="value_type">' +
        '<option>UNSIGNED</option><option>FLOAT</option><option>CHAR</option><option>TEXT</option>' +
        "</select></div></div>" +
        '<div><label>SSH-Befehl</label><input data-k="command" type="text" placeholder="redis-cli info clients | awk -F: \'/connected_clients/{print $2}\'"></div>' +
        '<div class="row-3">' +
        '<div><label>Einheit</label><input data-k="units" type="text" placeholder="%, B, ms"></div>' +
        '<div><label>Intervall</label><input data-k="delay" type="text" placeholder="1m"></div>' +
        '<div><label>Trigger (optional)</label><input data-k="trigger_expr" type="text" placeholder="last({ITEM})=0"></div>' +
        "</div>" +
        '<div class="actions"><button type="button" class="btn-ghost btn-small" data-del>Entfernen</button></div>';
      wrap.querySelector('[data-k="name"]').value = row.name;
      wrap.querySelector('[data-k="command"]').value = row.command;
      wrap.querySelector('[data-k="value_type"]').value = row.value_type || "UNSIGNED";
      wrap.querySelector('[data-k="units"]').value = row.units || "";
      wrap.querySelector('[data-k="delay"]').value = row.delay || "1m";
      wrap.querySelector('[data-k="trigger_expr"]').value = row.trigger_expr || "";
      wrap.querySelectorAll("[data-k]").forEach((inp) => {
        inp.addEventListener("input", () => {
          state.customItems[idx][inp.dataset.k] = inp.value;
        });
      });
      wrap.querySelector("[data-del]").addEventListener("click", () => {
        state.customItems.splice(idx, 1);
        renderCustom();
      });
      box.appendChild(wrap);
    });
  }

  function collectCfg() {
    return {
      templateName: $("#templateName").value.trim() || "Custom Linux by SSH",
      zabbixVersion: $("#zabbixVersion").value,
      groupName: $("#groupName").value.trim() || "Templates/Applications",
      vendor: "ZTG",
      authtype: $("#authtype").value,
      sshUser: $("#sshUser").value.trim() || "zabbix",
      sshPort: $("#sshPort").value.trim() || "22",
      interval: $("#interval").value.trim() || "1m",
      cpuCores: $("#cpuCores").checked,
      intent: $("#intent").value,
      processes: $("#processes").value,
      modules: Array.from(state.modules),
      customItems: state.customItems
    };
  }

  function generate() {
    const intent = $("#intent").value;
    if (intent.trim()) {
      window.ZTGGenerator.detectModules(intent, Array.from(state.modules)).forEach((id) => state.modules.add(id));
      renderModules();
    }
    const result = window.ZTGGenerator.build(collectCfg());
    state.last = result;
    $("#yaml").textContent = result.yaml;
    $("#s-items").textContent = result.stats.items;
    $("#s-disc").textContent = result.stats.discovery;
    $("#s-proto").textContent = result.stats.prototypes;
    $("#s-trig").textContent = result.stats.triggers;
    $("#readme").textContent = result.readme;
    $("#status").innerHTML = '<span class="ok">Template erzeugt.</span> Module: ' + result.stats.modules.join(", ");
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/yaml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function filename() {
    const name = ($("#templateName").value || "zabbix-template")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    return name + ".yaml";
  }

  function copyYaml() {
    const text = $("#yaml").textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      $("#status").innerHTML = '<span class="ok">YAML in die Zwischenablage kopiert.</span>';
    });
  }

  function init() {
    const prof = $("#profiles");
    window.ZTG_PROFILES.forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (p.id === state.profile ? " active" : "");
      b.dataset.id = p.id;
      b.textContent = p.name;
      b.addEventListener("click", () => applyProfile(p.id));
      prof.appendChild(b);
    });
    renderModules();
    $("#add-custom").addEventListener("click", () => addCustomRow());
    $("#generate").addEventListener("click", generate);
    $("#download").addEventListener("click", () => {
      if (!state.last) generate();
      download(filename(), state.last.yaml);
    });
    $("#download-readme").addEventListener("click", () => {
      if (!state.last) generate();
      download(filename().replace(/\.yaml$/, "") + "_README.md", state.last.readme);
    });
    $("#copy").addEventListener("click", copyYaml);
    generate();
  }

  init();
})();
