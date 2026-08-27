window.ZTGGenerator = (function () {
  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const hex = (h >>> 0).toString(16).padStart(8, "0");
    let out = "";
    for (let i = 0; i < 4; i++) out += hex;
    return out.slice(0, 32);
  }

  function uuid(ns, name) {
    return hash32(ns + "::" + name);
  }

  function slug(s) {
    return String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "")
      .slice(0, 48) || "item";
  }

  function sshFields(cfg) {
    const f = {
      type: "SSH",
      username: "{$SSH.USER}",
      authtype: cfg.authtype
    };
    if (cfg.authtype === "PUBLIC_KEY") {
      f.publickey = "{$SSH.PUBLICKEY}";
      f.privatekey = "{$SSH.PRIVATEKEY}";
      if (cfg.includePassphrase) f.password = "{$SSH.KEY.PASSPHRASE}";
    } else {
      f.password = "{$SSH.PASSWORD}";
    }
    return f;
  }

  function sshKey(desc, cfg) {
    return "ssh.run[" + desc + ",,{$SSH.PORT}]";
  }

  function tag(component, scope) {
    const tags = [{ tag: "component", value: component }];
    if (scope) tags.push({ tag: "scope", value: scope });
    return tags;
  }

  function jsonPathPre(path) {
    return [
      { type: "JSONPATH", parameters: [path] },
      { type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["1h"] }
    ];
  }

  function depItem(opts) {
    const item = {
      uuid: opts.uuid,
      name: opts.name,
      type: "DEPENDENT",
      key: opts.key,
      value_type: opts.value_type || "FLOAT",
      master_item: { key: opts.master },
      preprocessing: opts.preprocessing || jsonPathPre(opts.jsonpath),
      tags: opts.tags || tag("system")
    };
    if (opts.units) item.units = opts.units;
    if (opts.history) item.history = opts.history;
    if (opts.trends) item.trends = opts.trends;
    if (opts.description) item.description = opts.description;
    if (opts.triggers) item.triggers = opts.triggers;
    return item;
  }

  function trigger(opts) {
    const t = {
      uuid: opts.uuid,
      expression: opts.expression,
      name: opts.name,
      priority: opts.priority || "WARNING",
      manual_close: "YES"
    };
    if (opts.description) t.description = opts.description;
    if (opts.event_name) t.event_name = opts.event_name;
    if (opts.tags) t.tags = opts.tags;
    return t;
  }

  function parseProcesses(text) {
    return (text || "")
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
  }

  function parseCustomItems(rows) {
    return (rows || []).filter((r) => r && r.name && r.command);
  }

  function detectModules(text, selected) {
    const set = new Set(selected || []);
    const t = text || "";
    window.ZTG_KEYWORD_MAP.forEach((m) => {
      if (m.re.test(t)) set.add(m.id);
    });
    return Array.from(set);
  }

  function build(cfg) {
    const templateName = (cfg.templateName || "Custom Linux by SSH").trim();
    const version = cfg.zabbixVersion || "7.0";
    const modules = detectModules(cfg.intent, cfg.modules);
    const processes = parseProcesses(cfg.processes);
    const customItems = parseCustomItems(cfg.customItems);
    const groupName = cfg.groupName || "Templates/Applications";
    const vendor = cfg.vendor || "ZTG";

    const tUuid = uuid("template", templateName);
    const gUuid = uuid("tgroup", groupName);

    const items = [];
    const discovery = [];
    const macros = [
      { macro: "{$SSH.USER}", value: cfg.sshUser || "zabbix", description: "SSH-Benutzer auf dem Zielhost" },
      { macro: "{$SSH.PORT}", value: String(cfg.sshPort || "22"), description: "SSH-Port" }
    ];
    if (cfg.authtype === "PUBLIC_KEY") {
      macros.push({ macro: "{$SSH.PUBLICKEY}", value: "id_rsa.pub", description: "Dateiname des Public Keys unter SSHKeyLocation" });
      macros.push({ macro: "{$SSH.PRIVATEKEY}", value: "id_rsa", description: "Dateiname des Private Keys unter SSHKeyLocation" });
    } else {
      macros.push({ macro: "{$SSH.PASSWORD}", value: "", description: "SSH-Passwort (besser: Key-Auth nutzen)" });
    }

    const readme = buildReadme(templateName, modules, cfg);

    if (modules.includes("availability")) addAvailability(items, templateName, cfg, tUuid);
    if (modules.includes("system") || modules.includes("cpu") || modules.includes("memory")) {
      addSystemBundle(items, templateName, cfg, modules);
    }
    if (modules.includes("cpu") && cfg.cpuCores) addCpuCores(items, discovery, templateName, cfg);
    if (modules.includes("filesystem")) addFilesystems(items, discovery, templateName, cfg);
    if (modules.includes("disks")) addDisks(items, discovery, templateName, cfg);
    if (modules.includes("network")) addNetwork(items, discovery, templateName, cfg);
    if (modules.includes("systemd")) addSystemd(items, discovery, templateName, cfg);
    if (modules.includes("processes") || processes.length) addProcesses(items, discovery, templateName, cfg, processes);
    if (modules.includes("security")) addSecurity(items, templateName, cfg);
    if (modules.includes("docker")) addDocker(items, discovery, templateName, cfg);
    if (modules.includes("nginx")) addNginx(items, templateName, cfg);
    if (modules.includes("apache")) addApache(items, templateName, cfg);
    if (modules.includes("mysql")) addMysql(items, templateName, cfg);
    if (modules.includes("postgres")) addPostgres(items, discovery, templateName, cfg);
    customItems.forEach((row, i) => addCustom(items, templateName, cfg, row, i));

    addThresholdMacros(macros, modules);

    const tpl = {
      uuid: tUuid,
      template: templateName,
      name: templateName,
      description: readme.short,
      vendor: { name: vendor, version: version + "-1" },
      groups: [{ name: groupName }],
      items: items,
      macros: macros,
      tags: [
        { tag: "class", value: "os" },
        { tag: "target", value: "linux" },
        { tag: "monitoring", value: "ssh" }
      ]
    };
    if (discovery.length) tpl.discovery_rules = discovery;

    const doc = {
      zabbix_export: {
        version: version,
        template_groups: [{ uuid: gUuid, name: groupName }],
        templates: [tpl]
      }
    };

    return {
      yaml: window.ZTGYaml.dump(doc),
      stats: {
        items: items.length,
        discovery: discovery.length,
        prototypes: discovery.reduce((n, d) => n + ((d.item_prototypes || []).length), 0),
        triggers:
          items.reduce((n, it) => n + ((it.triggers || []).length), 0) +
          discovery.reduce((n, d) => n + ((d.trigger_prototypes || []).length), 0) +
          discovery.reduce(
            (n, d) => n + (d.item_prototypes || []).reduce((m, p) => m + ((p.triggers || []).length), 0),
            0
          ),
        modules: modules,
        templateName: templateName
      },
      readme: readme.full
    };
  }

  function buildReadme(name, modules, cfg) {
    const short =
      "Automatisch generiertes SSH-Template.\n" +
      "Master-Items holen JSON per SSH, Child-Items und LLD-Prototypen sind Dependent Items.\n" +
      "Module: " + modules.join(", ") + ".\n" +
      "Generator: Zabbix Template Generator (ZTG).";
    const full = [
      "# " + name,
      "",
      "## Voraussetzung",
      "- Zabbix Server/Proxy mit SSH-Support (libssh/libssh2)",
      "- Zielhost: Linux mit SSH, Befehle wie awk, df, systemctl (je nach Modul)",
      "- Host-Interface: Dummy oder Agent-Interface spielt für SSH-Items keine Rolle; SSH verbindet auf {$SSH.PORT}",
      "",
      "## Makros am Host oder Template setzen",
      "- {$SSH.USER} – SSH-User (sudo-frei, nur lesende Commands)",
      cfg.authtype === "PUBLIC_KEY"
        ? "- {$SSH.PUBLICKEY} / {$SSH.PRIVATEKEY} – Dateinamen relativ zu SSHKeyLocation auf dem Server"
        : "- {$SSH.PASSWORD} – nur falls keine Key-Auth",
      "- {$SSH.PORT} – Standard 22",
      "",
      "## Import",
      "1. Data collection → Templates → Import",
      "2. YAML-Datei wählen",
      "3. Template an Host linken und Makros pflegen",
      "",
      "## Architektur",
      "Jedes Themengebiet hat typischerweise:",
      "1. ein SSH-Master-Item (rohes JSON, History kurz)",
      "2. Dependent Child-Items mit JSONPath",
      "3. ggf. eine Dependent LLD-Rule mit Item-/Trigger-Prototypen",
      "",
      "So entsteht nur eine SSH-Session pro Themengebiet und Intervall, nicht pro Metrik.",
      "",
      "## Module",
      modules.map((m) => "- " + m).join("\n")
    ].join("\n");
    return { short, full };
  }

  function addThresholdMacros(macros, modules) {
    const add = (macro, value, description) => {
      if (!macros.some((m) => m.macro === macro)) macros.push({ macro, value, description });
    };
    if (modules.includes("cpu")) {
      add("{$CPU.UTIL.CRIT}", "90", "CPU-Auslastung kritisch (%)");
      add("{$LOAD.CRIT.MAX}", "5", "Load15 pro Kern-Schwelle (Faktor)");
    }
    if (modules.includes("memory")) {
      add("{$MEMORY.UTIL.MAX}", "90", "RAM-Auslastung Warnung (%)");
      add("{$SWAP.UTIL.MAX}", "80", "Swap-Auslastung Warnung (%)");
    }
    if (modules.includes("filesystem")) {
      add("{$VFS.FS.PUSED.MAX.WARN}", "80", "Dateisystem Used% Warnung");
      add("{$VFS.FS.PUSED.MAX.CRIT}", "90", "Dateisystem Used% Critical");
      add("{$VFS.FS.FSNAME.NOT_MATCHES}", "^(/dev|/sys|/run|/proc)(/.*)?$", "FS-Namen ausschließen");
      add("{$VFS.FS.FSTYPE.MATCHES}", "^(ext[234]|xfs|btrfs|zfs|nfs.*|vfat|ntfs)$", "Erlaubte FS-Typen");
    }
    if (modules.includes("network")) {
      add("{$IF.UTIL.MAX}", "90", "Interface-Auslastung % (optional, ohne Speed oft ungenutzt)");
      add("{$NET.IF.IFNAME.NOT_MATCHES}", "^(lo|docker.*|veth.*|br-.*|virbr.*)$", "Interfaces ausschließen");
    }
    if (modules.includes("systemd")) {
      add("{$SYSTEMD.NAME.MATCHES}", ".*", "Service-Namen die entdeckt werden");
    }
    if (modules.includes("docker")) {
      add("{$DOCKER.BIN}", "docker", "Docker-Binary");
    }
  }

  /* ---------- modules ---------- */

  function addAvailability(items, tname, cfg) {
    items.push({
      uuid: uuid(tname, "ssh.tcp"),
      name: "SSH service is available",
      type: "SIMPLE",
      key: "net.tcp.service[ssh,,{$SSH.PORT}]",
      delay: "1m",
      history: "7d",
      value_type: "UNSIGNED",
      description: "TCP-Check auf den SSH-Port. Unabhängig vom SSH-Login.",
      tags: tag("availability"),
      triggers: [
        trigger({
          uuid: uuid(tname, "trig.ssh.down"),
          expression: "max(/" + tname + "/net.tcp.service[ssh,,{$SSH.PORT}],#3)=0",
          name: "SSH-Port ist nicht erreichbar",
          priority: "HIGH",
          description: "Port {$SSH.PORT} antwortet nicht. Dienst, Firewall oder Netz prüfen.",
          tags: [{ tag: "scope", value: "availability" }]
        })
      ]
    });

    const key = sshKey("ssh.echo", cfg);
    items.push(Object.assign({
      uuid: uuid(tname, "ssh.echo"),
      name: "SSH agent echo",
      key: key,
      delay: "1m",
      history: "7d",
      value_type: "UNSIGNED",
      params: "echo 1",
      description: "Führt per SSH 'echo 1' aus. Prüft Login + Shell.",
      tags: tag("availability"),
      triggers: [
        trigger({
          uuid: uuid(tname, "trig.ssh.echo"),
          expression: "nodata(/" + tname + "/" + key + ",5m)=1",
          name: "SSH-Login liefert keine Daten",
          priority: "HIGH",
          description: "SSH-Auth oder Remote-Shell schlägt fehl (Makros, Key, sudo, shell).",
          tags: [{ tag: "scope", value: "availability" }]
        })
      ]
    }, sshFields(cfg)));
  }

  function addSystemBundle(items, tname, cfg, modules) {
    const masterKey = sshKey("system.metrics", cfg);
    const script = [
      "awk 'BEGIN{u=0;n=0;s=0;i=0;w=0;t=0}",
      "/MemTotal/{mt=$2}",
      "/MemAvailable/{ma=$2}",
      "/SwapTotal/{st=$2}",
      "/SwapFree/{sf=$2}",
      "END{}",
      "' /proc/meminfo >/dev/null",
      "mt=$(awk '/MemTotal/{print $2}' /proc/meminfo)",
      "ma=$(awk '/MemAvailable/{print $2}' /proc/meminfo)",
      "st=$(awk '/SwapTotal/{print $2}' /proc/meminfo)",
      "sf=$(awk '/SwapFree/{print $2}' /proc/meminfo)",
      "up=$(awk '{printf \"%d\", $1}' /proc/uptime)",
      "l1=$(awk '{print $1}' /proc/loadavg)",
      "l5=$(awk '{print $2}' /proc/loadavg)",
      "l15=$(awk '{print $3}' /proc/loadavg)",
      "cores=$(nproc 2>/dev/null || grep -c ^processor /proc/cpuinfo)",
      "read user nice system idle iowait irq softirq steal guest guest_nice _ < /proc/stat",
      "total=$((user+nice+system+idle+iowait+irq+softirq+steal))",
      "busy=$((total-idle-iowait))",
      "cpu=0",
      "[ \"$total\" -gt 0 ] && cpu=$(awk -v b=\"$busy\" -v t=\"$total\" 'BEGIN{printf \"%.2f\", 100*b/t}')",
      "mem=0; swap=0",
      "[ \"${mt:-0}\" -gt 0 ] && mem=$(awk -v t=\"$mt\" -v a=\"$ma\" 'BEGIN{printf \"%.2f\", (t-a)*100/t}')",
      "[ \"${st:-0}\" -gt 0 ] && swap=$(awk -v t=\"$st\" -v f=\"$sf\" 'BEGIN{printf \"%.2f\", (t-f)*100/t}')",
      "hn=$(hostname -s 2>/dev/null || hostname)",
      "os=$(. /etc/os-release 2>/dev/null; echo ${PRETTY_NAME:-unknown})",
      "kern=$(uname -r)",
      "printf '{\"hostname\":\"%s\",\"os\":\"%s\",\"kernel\":\"%s\",\"uptime\":%s,\"load1\":%s,\"load5\":%s,\"load15\":%s,\"cpu_util\":%s,\"cores\":%s,\"mem_pused\":%s,\"mem_total_kb\":%s,\"mem_avail_kb\":%s,\"swap_pused\":%s,\"swap_total_kb\":%s}\\n' \\",
      "  \"$hn\" \"$os\" \"$kern\" \"$up\" \"$l1\" \"$l5\" \"$l15\" \"$cpu\" \"$cores\" \"$mem\" \"${mt:-0}\" \"${ma:-0}\" \"$swap\" \"${st:-0}\""
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "system.metrics"),
      name: "System metrics (master)",
      key: masterKey,
      delay: cfg.interval || "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      description: "Sammelt CPU/RAM/Load/Uptime als JSON. Child-Items sind Dependent.",
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    const mkDep = (name, key, path, extra) => {
      extra = extra || {};
      const it = depItem({
        uuid: uuid(tname, key),
        name: name,
        key: key,
        master: masterKey,
        jsonpath: path,
        value_type: extra.value_type || "FLOAT",
        units: extra.units,
        tags: tag(extra.component || "system"),
        description: extra.description,
        triggers: extra.triggers
      });
      if (extra.value_type === "CHAR" || extra.value_type === "TEXT") {
        it.trends = "0";
        it.preprocessing = [
          { type: "JSONPATH", parameters: [path] },
          { type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["6h"] }
        ];
      }
      items.push(it);
    };

    if (modules.includes("system")) {
      mkDep("Host name", "system.hostname", "$.hostname", { value_type: "CHAR", component: "system" });
      mkDep("Operating system", "system.os", "$.os", { value_type: "CHAR", component: "os" });
      mkDep("Kernel version", "system.kernel", "$.kernel", { value_type: "CHAR", component: "os" });
      mkDep("Uptime", "system.uptime", "$.uptime", {
        value_type: "UNSIGNED",
        units: "uptime",
        component: "system",
        triggers: [
          trigger({
            uuid: uuid(tname, "trig.reboot"),
            expression: "last(/" + tname + "/system.uptime)<10m",
            name: "Host wurde kürzlich neu gestartet",
            priority: "INFO",
            tags: [{ tag: "scope", value: "notice" }]
          })
        ]
      });
    }

    if (modules.includes("cpu")) {
      mkDep("Number of CPUs", "system.cpu.num", "$.cores", { value_type: "UNSIGNED", units: "", component: "cpu" });
      mkDep("CPU utilization", "system.cpu.util", "$.cpu_util", {
        units: "%",
        component: "cpu",
        triggers: [
          trigger({
            uuid: uuid(tname, "trig.cpu"),
            expression: "min(/" + tname + "/system.cpu.util,5m)>{$CPU.UTIL.CRIT}",
            name: "CPU-Auslastung ist zu hoch (über {$CPU.UTIL.CRIT}%)",
            priority: "AVERAGE",
            tags: [{ tag: "scope", value: "performance" }]
          })
        ]
      });
      mkDep("Load average (1m)", "system.cpu.load[avg1]", "$.load1", { component: "cpu" });
      mkDep("Load average (5m)", "system.cpu.load[avg5]", "$.load5", { component: "cpu" });
      mkDep("Load average (15m)", "system.cpu.load[avg15]", "$.load15", {
        component: "cpu",
        triggers: [
          trigger({
            uuid: uuid(tname, "trig.load"),
            expression: "min(/" + tname + "/system.cpu.load[avg15],5m) / last(/" + tname + "/system.cpu.num) > {$LOAD.CRIT.MAX}",
            name: "Load average 15m ist zu hoch",
            priority: "AVERAGE",
            tags: [{ tag: "scope", value: "performance" }]
          })
        ]
      });
    }

    if (modules.includes("memory")) {
      mkDep("Memory utilization", "vm.memory.util", "$.mem_pused", {
        units: "%",
        component: "memory",
        triggers: [
          trigger({
            uuid: uuid(tname, "trig.mem"),
            expression: "min(/" + tname + "/vm.memory.util,5m)>{$MEMORY.UTIL.MAX}",
            name: "RAM-Auslastung ist zu hoch (über {$MEMORY.UTIL.MAX}%)",
            priority: "AVERAGE",
            tags: [{ tag: "scope", value: "capacity" }]
          })
        ]
      });
      mkDep("Memory total", "vm.memory.total", "$.mem_total_kb", { value_type: "UNSIGNED", units: "B", component: "memory" });
      items[items.length - 1].preprocessing = [
        { type: "JSONPATH", parameters: ["$.mem_total_kb"] },
        { type: "MULTIPLIER", parameters: ["1024"] }
      ];
      mkDep("Memory available", "vm.memory.available", "$.mem_avail_kb", { value_type: "UNSIGNED", units: "B", component: "memory" });
      items[items.length - 1].preprocessing = [
        { type: "JSONPATH", parameters: ["$.mem_avail_kb"] },
        { type: "MULTIPLIER", parameters: ["1024"] }
      ];
      mkDep("Swap utilization", "system.swap.pused", "$.swap_pused", {
        units: "%",
        component: "memory",
        triggers: [
          trigger({
            uuid: uuid(tname, "trig.swap"),
            expression: "min(/" + tname + "/system.swap.pused,5m)>{$SWAP.UTIL.MAX}",
            name: "Swap-Auslastung ist zu hoch",
            priority: "WARNING",
            tags: [{ tag: "scope", value: "capacity" }]
          })
        ]
      });
    }
  }

  function addCpuCores(items, discovery, tname, cfg) {
    const masterKey = sshKey("cpu.percore", cfg);
    const script = [
      "echo '['",
      "awk '/^cpu[0-9]+/ {",
      "  id=$1; sub(/^cpu/,\"\",id);",
      "  total=$2+$3+$4+$5+$6+$7+$8+$9;",
      "  idle=$5+$6;",
      "  util=(total>0)?(100*(total-idle)/total):0;",
      "  if (n++) printf \",\\n\";",
      "  printf \"{\\\"core\\\":\\\"%s\\\",\\\"util\\\":%.2f}\", id, util",
      "}' /proc/stat",
      "echo",
      "echo ']'"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "cpu.percore"),
      name: "CPU per-core metrics (master)",
      key: masterKey,
      delay: cfg.interval || "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    discovery.push({
      uuid: uuid(tname, "cpu.core.discovery"),
      name: "CPU core discovery",
      type: "DEPENDENT",
      key: "system.cpu.core.discovery",
      delay: "0",
      lifetime: "30d",
      description: "Legt automatisch ein Item pro CPU-Kern an.",
      master_item: { key: masterKey },
      preprocessing: [{ type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["6h"] }],
      lld_macro_paths: [{ lld_macro: "{#CORE}", path: "$.core" }],
      item_prototypes: [
        depItem({
          uuid: uuid(tname, "proto.cpu.core"),
          name: "CPU utilization [core {#CORE}]",
          key: "system.cpu.util[{#CORE}]",
          master: masterKey,
          units: "%",
          tags: tag("cpu"),
          preprocessing: [
            { type: "JSONPATH", parameters: ["$[?(@.core=='{#CORE}')].util.first()"] }
          ]
        })
      ]
    });
  }

  function addFilesystems(items, discovery, tname, cfg) {
    const masterKey = sshKey("vfs.fs.get", cfg);
    const script = [
      "if command -v findmnt >/dev/null 2>&1; then",
      "  echo '['",
      "  findmnt -bno TARGET,FSTYPE,SIZE,USED -r 2>/dev/null | awk 'NR>1 {",
      "    fs=$1; typ=$2; total=$3+0; used=$4+0;",
      "    pused=(total>0)?(100*used/total):0;",
      "    if (n++) printf \",\\n\";",
      "    printf \"{\\\"fsname\\\":\\\"%s\\\",\\\"fstype\\\":\\\"%s\\\",\\\"total\\\":%s,\\\"used\\\":%s,\\\"pused\\\":%.2f}\", fs, typ, total, used, pused",
      "  }'",
      "  echo",
      "  echo ']'",
      "else",
      "  echo '['",
      "  df -PTBk 2>/dev/null | awk 'NR>1 {",
      "    gsub(/%/,\"\",$6);",
      "    typ=$2; total=$3*1024; used=$4*1024; pused=$6+0; fs=$7;",
      "    if (n++) printf \",\\n\";",
      "    printf \"{\\\"fsname\\\":\\\"%s\\\",\\\"fstype\\\":\\\"%s\\\",\\\"total\\\":%s,\\\"used\\\":%s,\\\"pused\\\":%.2f}\", fs, typ, total, used, pused",
      "  }'",
      "  echo",
      "  echo ']'",
      "fi"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "vfs.fs.get"),
      name: "Filesystems (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      description: "JSON aller Mounts. LLD + Child-Items hängen daran.",
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    const proto = (name, key, path, extra) => {
      extra = extra || {};
      const it = {
        uuid: uuid(tname, "proto." + key),
        name: name,
        type: "DEPENDENT",
        key: key,
        value_type: extra.value_type || "FLOAT",
        master_item: { key: masterKey },
        preprocessing: [{ type: "JSONPATH", parameters: [path] }],
        tags: tag("filesystem")
      };
      if (extra.units) it.units = extra.units;
      if (extra.triggers) it.triggers = extra.triggers;
      return it;
    };

    discovery.push({
      uuid: uuid(tname, "vfs.fs.discovery"),
      name: "Filesystem discovery",
      type: "DEPENDENT",
      key: "vfs.fs.discovery",
      delay: "0",
      lifetime: "30d",
      description: "Legt automatisch Items je Mountpoint an.",
      master_item: { key: masterKey },
      preprocessing: [{ type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["1h"] }],
      lld_macro_paths: [
        { lld_macro: "{#FSNAME}", path: "$.fsname" },
        { lld_macro: "{#FSTYPE}", path: "$.fstype" }
      ],
      filter: {
        evaltype: "AND",
        conditions: [
          { macro: "{#FSNAME}", value: "{$VFS.FS.FSNAME.NOT_MATCHES}", operator: "NOT_MATCHES_REGEX", formulaid: "A" },
          { macro: "{#FSTYPE}", value: "{$VFS.FS.FSTYPE.MATCHES}", operator: "MATCHES_REGEX", formulaid: "B" }
        ]
      },
      item_prototypes: [
        proto("FS [{#FSNAME}]: Space used (%)", "vfs.fs.pused[{#FSNAME}]", "$[?(@.fsname=='{#FSNAME}')].pused.first()", {
          units: "%",
          triggers: [
            trigger({
              uuid: uuid(tname, "trig.fs.warn"),
              expression: "min(/" + tname + "/vfs.fs.pused[{#FSNAME}],5m)>{$VFS.FS.PUSED.MAX.WARN}",
              name: "Dateisystem [{#FSNAME}]: viel belegt (Warnung)",
              priority: "WARNING"
            }),
            trigger({
              uuid: uuid(tname, "trig.fs.crit"),
              expression: "min(/" + tname + "/vfs.fs.pused[{#FSNAME}],5m)>{$VFS.FS.PUSED.MAX.CRIT}",
              name: "Dateisystem [{#FSNAME}]: fast voll",
              priority: "AVERAGE"
            })
          ]
        }),
        proto("FS [{#FSNAME}]: Total space", "vfs.fs.total[{#FSNAME}]", "$[?(@.fsname=='{#FSNAME}')].total.first()", {
          value_type: "UNSIGNED",
          units: "B"
        }),
        proto("FS [{#FSNAME}]: Used space", "vfs.fs.used[{#FSNAME}]", "$[?(@.fsname=='{#FSNAME}')].used.first()", {
          value_type: "UNSIGNED",
          units: "B"
        })
      ]
    });
  }

  function addDisks(items, discovery, tname, cfg) {
    const masterKey = sshKey("vfs.dev.get", cfg);
    const script = [
      "echo '['",
      "awk 'NR>1 && $3 !~ /[0-9]$/ {",
      "  name=$3; reads=$4; writes=$8; sectors_r=$6; sectors_w=$10;",
      "  if (n++) printf \",\\n\";",
      "  printf \"{\\\"name\\\":\\\"%s\\\",\\\"reads\\\":%s,\\\"writes\\\":%s,\\\"read_bytes\\\":%s,\\\"write_bytes\\\":%s}\", name, reads, writes, sectors_r*512, sectors_w*512",
      "}' /proc/diskstats",
      "echo",
      "echo ']'"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "vfs.dev.get"),
      name: "Block devices (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    const proto = (name, key, path, extra) => ({
      uuid: uuid(tname, "proto." + key),
      name: name,
      type: "DEPENDENT",
      key: key,
      value_type: extra.value_type || "FLOAT",
      units: extra.units || "",
      master_item: { key: masterKey },
      preprocessing: [
        { type: "JSONPATH", parameters: [path] },
        { type: extra.change || "CHANGE_PER_SECOND" }
      ],
      tags: tag("storage")
    });

    discovery.push({
      uuid: uuid(tname, "vfs.dev.discovery"),
      name: "Block device discovery",
      type: "DEPENDENT",
      key: "vfs.dev.discovery",
      delay: "0",
      lifetime: "30d",
      master_item: { key: masterKey },
      preprocessing: [{ type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["6h"] }],
      lld_macro_paths: [{ lld_macro: "{#DEVNAME}", path: "$.name" }],
      item_prototypes: [
        proto("Disk [{#DEVNAME}]: Read rate", "vfs.dev.read.rate[{#DEVNAME}]", "$[?(@.name=='{#DEVNAME}')].reads.first()", { units: "rps" }),
        proto("Disk [{#DEVNAME}]: Write rate", "vfs.dev.write.rate[{#DEVNAME}]", "$[?(@.name=='{#DEVNAME}')].writes.first()", { units: "wps" }),
        proto("Disk [{#DEVNAME}]: Read bytes/s", "vfs.dev.read.bps[{#DEVNAME}]", "$[?(@.name=='{#DEVNAME}')].read_bytes.first()", { units: "Bps" }),
        proto("Disk [{#DEVNAME}]: Write bytes/s", "vfs.dev.write.bps[{#DEVNAME}]", "$[?(@.name=='{#DEVNAME}')].write_bytes.first()", { units: "Bps" })
      ]
    });
  }

  function addNetwork(items, discovery, tname, cfg) {
    const masterKey = sshKey("net.if.get", cfg);
    const script = [
      "echo '['",
      "awk -F'[: ]+' 'NR>2 && $2 != \"\" {",
      "  name=$2; rx=$3; tx=$11; rxerr=$5; txerr=$13; rxdrop=$6; txdrop=$14;",
      "  if (n++) printf \",\\n\";",
      "  printf \"{\\\"ifname\\\":\\\"%s\\\",\\\"rx\\\":%s,\\\"tx\\\":%s,\\\"rxerr\\\":%s,\\\"txerr\\\":%s,\\\"rxdrop\\\":%s,\\\"txdrop\\\":%s}\", name, rx, tx, rxerr, txerr, rxdrop, txdrop",
      "}' /proc/net/dev",
      "echo",
      "echo ']'"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "net.if.get"),
      name: "Network interfaces (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    const proto = (name, key, path, units) => ({
      uuid: uuid(tname, "proto." + key),
      name: name,
      type: "DEPENDENT",
      key: key,
      value_type: "FLOAT",
      units: units,
      master_item: { key: masterKey },
      preprocessing: [
        { type: "JSONPATH", parameters: [path] },
        { type: "CHANGE_PER_SECOND" }
      ],
      tags: tag("network")
    });

    discovery.push({
      uuid: uuid(tname, "net.if.discovery"),
      name: "Network interface discovery",
      type: "DEPENDENT",
      key: "net.if.discovery",
      delay: "0",
      lifetime: "30d",
      master_item: { key: masterKey },
      preprocessing: [{ type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["1h"] }],
      lld_macro_paths: [{ lld_macro: "{#IFNAME}", path: "$.ifname" }],
      filter: {
        evaltype: "AND",
        conditions: [
          { macro: "{#IFNAME}", value: "{$NET.IF.IFNAME.NOT_MATCHES}", operator: "NOT_MATCHES_REGEX", formulaid: "A" }
        ]
      },
      item_prototypes: [
        proto("IF [{#IFNAME}]: Bits received", "net.if.in[{#IFNAME}]", "$[?(@.ifname=='{#IFNAME}')].rx.first()", "bps"),
        proto("IF [{#IFNAME}]: Bits sent", "net.if.out[{#IFNAME}]", "$[?(@.ifname=='{#IFNAME}')].tx.first()", "bps"),
        proto("IF [{#IFNAME}]: In errors/s", "net.if.in.errors[{#IFNAME}]", "$[?(@.ifname=='{#IFNAME}')].rxerr.first()", "eps"),
        proto("IF [{#IFNAME}]: Out errors/s", "net.if.out.errors[{#IFNAME}]", "$[?(@.ifname=='{#IFNAME}')].txerr.first()", "eps"),
        proto("IF [{#IFNAME}]: In drops/s", "net.if.in.dropped[{#IFNAME}]", "$[?(@.ifname=='{#IFNAME}')].rxdrop.first()", "eps")
      ],
      trigger_prototypes: [
        trigger({
          uuid: uuid(tname, "trig.if.err"),
          expression: "min(/" + tname + "/net.if.in.errors[{#IFNAME}],5m)>2",
          name: "Interface [{#IFNAME}]: Empfangsfehler",
          priority: "WARNING"
        })
      ]
    });

    // bits: multiply bytes * 8
    discovery[discovery.length - 1].item_prototypes[0].preprocessing.splice(1, 0, {
      type: "MULTIPLIER",
      parameters: ["8"]
    });
    discovery[discovery.length - 1].item_prototypes[1].preprocessing.splice(1, 0, {
      type: "MULTIPLIER",
      parameters: ["8"]
    });
  }

  function addSystemd(items, discovery, tname, cfg) {
    const masterKey = sshKey("systemd.get", cfg);
    const script = [
      "echo '['",
      "systemctl list-units --type=service --no-legend --no-pager --all 2>/dev/null | awk '{",
      "  name=$1; sub(/\\.service$/,\"\",name);",
      "  load=$2; active=$3; substate=$4;",
      "  running=(active==\"active\" && substate==\"running\")?1:0;",
      "  if (name==\"\") next;",
      "  if (n++) printf \",\\n\";",
      "  printf \"{\\\"name\\\":\\\"%s\\\",\\\"active\\\":\\\"%s\\\",\\\"sub\\\":\\\"%s\\\",\\\"running\\\":%d}\", name, active, substate, running",
      "}'",
      "echo",
      "echo ']'"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "systemd.get"),
      name: "Systemd services (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    discovery.push({
      uuid: uuid(tname, "systemd.discovery"),
      name: "Systemd service discovery",
      type: "DEPENDENT",
      key: "systemd.service.discovery",
      delay: "0",
      lifetime: "7d",
      master_item: { key: masterKey },
      preprocessing: [{ type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["30m"] }],
      lld_macro_paths: [
        { lld_macro: "{#SERVICE}", path: "$.name" },
        { lld_macro: "{#ACTIVE}", path: "$.active" }
      ],
      filter: {
        evaltype: "AND",
        conditions: [
          { macro: "{#SERVICE}", value: "{$SYSTEMD.NAME.MATCHES}", operator: "MATCHES_REGEX", formulaid: "A" }
        ]
      },
      item_prototypes: [
        {
          uuid: uuid(tname, "proto.systemd.run"),
          name: "Service [{#SERVICE}]: running",
          type: "DEPENDENT",
          key: "systemd.service.running[{#SERVICE}]",
          value_type: "UNSIGNED",
          master_item: { key: masterKey },
          preprocessing: [
            { type: "JSONPATH", parameters: ["$[?(@.name=='{#SERVICE}')].running.first()"] }
          ],
          tags: tag("os"),
          triggers: [
            trigger({
              uuid: uuid(tname, "trig.svc.down"),
              expression: "last(/" + tname + "/systemd.service.running[{#SERVICE}])=0",
              name: "Service [{#SERVICE}] läuft nicht",
              priority: "AVERAGE"
            })
          ]
        }
      ]
    });
  }

  function addProcesses(items, discovery, tname, cfg, processes) {
    const list = processes.length ? processes : ["sshd", "cron", "nginx"];
    const masterKey = sshKey("proc.get", cfg);
    const names = list.map((p) => p.replace(/[^a-zA-Z0-9._-]/g, "")).filter(Boolean);
    const script = [
      "echo '['",
      names.map((p, i) => {
        return (
          "c=$(ps -C " + p + " --no-headers 2>/dev/null | wc -l);" +
          (i ? "echo ',';" : "") +
          "printf '{\"name\":\"" + p + "\",\"count\":%s}' \"$c\""
        );
      }).join("\n"),
      "echo",
      "echo ']'"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "proc.get"),
      name: "Process counts (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    discovery.push({
      uuid: uuid(tname, "proc.discovery"),
      name: "Process discovery",
      type: "DEPENDENT",
      key: "proc.num.discovery",
      delay: "0",
      lifetime: "30d",
      master_item: { key: masterKey },
      lld_macro_paths: [{ lld_macro: "{#PROCESS}", path: "$.name" }],
      item_prototypes: [
        {
          uuid: uuid(tname, "proto.proc"),
          name: "Process [{#PROCESS}]: count",
          type: "DEPENDENT",
          key: "proc.num[{#PROCESS}]",
          value_type: "UNSIGNED",
          master_item: { key: masterKey },
          preprocessing: [
            { type: "JSONPATH", parameters: ["$[?(@.name=='{#PROCESS}')].count.first()"] }
          ],
          tags: tag("os"),
          triggers: [
            trigger({
              uuid: uuid(tname, "trig.proc"),
              expression: "last(/" + tname + "/proc.num[{#PROCESS}])=0",
              name: "Prozess [{#PROCESS}] läuft nicht",
              priority: "HIGH"
            })
          ]
        }
      ]
    });
  }

  function addSecurity(items, tname, cfg) {
    const passKey = sshKey("security.passwd", cfg);
    items.push(Object.assign({
      uuid: uuid(tname, "security.passwd"),
      name: "Checksum of /etc/passwd",
      key: passKey,
      delay: "15m",
      history: "90d",
      trends: "0",
      value_type: "CHAR",
      params: "sha256sum /etc/passwd 2>/dev/null | awk '{print $1}'",
      preprocessing: [{ type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["1h"] }],
      tags: tag("security"),
      triggers: [
        trigger({
          uuid: uuid(tname, "trig.passwd"),
          expression: "(last(/" + tname + "/" + passKey + ",#1)<>last(/" + tname + "/" + passKey + ",#2))>0",
          name: "/etc/passwd wurde geändert",
          priority: "WARNING",
          tags: [{ tag: "scope", value: "security" }]
        })
      ]
    }, sshFields(cfg)));

    const failKey = sshKey("security.failed", cfg);
    items.push(Object.assign({
      uuid: uuid(tname, "security.failed"),
      name: "Failed SSH logins (last hour)",
      key: failKey,
      delay: "5m",
      history: "14d",
      value_type: "UNSIGNED",
      params: "journalctl -u ssh -u sshd --since '1 hour ago' -o cat 2>/dev/null | grep -ci 'Failed password' || grep -ci 'Failed password' /var/log/auth.log 2>/dev/null || echo 0",
      tags: tag("security"),
      triggers: [
        trigger({
          uuid: uuid(tname, "trig.failed"),
          expression: "min(/" + tname + "/" + failKey + ",30m)>20",
          name: "Viele fehlgeschlagene SSH-Logins",
          priority: "WARNING",
          tags: [{ tag: "scope", value: "security" }]
        })
      ]
    }, sshFields(cfg)));
  }

  function addDocker(items, discovery, tname, cfg) {
    const masterKey = sshKey("docker.get", cfg);
    const script = [
      "bin={$DOCKER.BIN}",
      "echo '['",
      "$bin ps -a --format '{{.ID}} {{.Names}} {{.State}} {{.Status}}' 2>/dev/null | awk '{",
      "  id=$1; name=$2; state=$3;",
      "  running=(state==\"running\")?1:0;",
      "  if (n++) printf \",\\n\";",
      "  printf \"{\\\"id\\\":\\\"%s\\\",\\\"name\\\":\\\"%s\\\",\\\"state\\\":\\\"%s\\\",\\\"running\\\":%d}\", id, name, state, running",
      "}'",
      "echo",
      "echo ']'"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "docker.get"),
      name: "Docker containers (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    discovery.push({
      uuid: uuid(tname, "docker.discovery"),
      name: "Docker container discovery",
      type: "DEPENDENT",
      key: "docker.container.discovery",
      delay: "0",
      lifetime: "7d",
      master_item: { key: masterKey },
      lld_macro_paths: [
        { lld_macro: "{#CONTAINER}", path: "$.name" },
        { lld_macro: "{#ID}", path: "$.id" },
        { lld_macro: "{#STATE}", path: "$.state" }
      ],
      item_prototypes: [
        {
          uuid: uuid(tname, "proto.docker.run"),
          name: "Container [{#CONTAINER}]: running",
          type: "DEPENDENT",
          key: "docker.container.running[{#CONTAINER}]",
          value_type: "UNSIGNED",
          master_item: { key: masterKey },
          preprocessing: [
            { type: "JSONPATH", parameters: ["$[?(@.name=='{#CONTAINER}')].running.first()"] }
          ],
          tags: tag("application"),
          triggers: [
            trigger({
              uuid: uuid(tname, "trig.docker"),
              expression: "last(/" + tname + "/docker.container.running[{#CONTAINER}])=0",
              name: "Container [{#CONTAINER}] läuft nicht",
              priority: "AVERAGE"
            })
          ]
        }
      ]
    });
  }

  function addNginx(items, tname, cfg) {
    const masterKey = sshKey("nginx.get", cfg);
    const script = [
      "proc=$(ps -C nginx --no-headers 2>/dev/null | wc -l)",
      "active=0; accepts=0; handled=0; requests=0; reading=0; writing=0; waiting=0",
      "st=$(curl -sS --max-time 2 http://127.0.0.1/nginx_status 2>/dev/null || curl -sS --max-time 2 http://127.0.0.1:80/stub_status 2>/dev/null || true)",
      "if [ -n \"$st\" ]; then",
      "  active=$(echo \"$st\" | awk '/Active/ {print $3}')",
      "  reading=$(echo \"$st\" | awk '/Reading/ {print $2}')",
      "  writing=$(echo \"$st\" | awk '/Writing/ {print $4}')",
      "  waiting=$(echo \"$st\" | awk '/Waiting/ {print $6}')",
      "  accepts=$(echo \"$st\" | awk 'NR==3{print $1}')",
      "  handled=$(echo \"$st\" | awk 'NR==3{print $2}')",
      "  requests=$(echo \"$st\" | awk 'NR==3{print $3}')",
      "fi",
      "printf '{\"workers\":%s,\"active\":%s,\"accepts\":%s,\"handled\":%s,\"requests\":%s,\"reading\":%s,\"writing\":%s,\"waiting\":%s}\\n' \\",
      "  \"${proc:-0}\" \"${active:-0}\" \"${accepts:-0}\" \"${handled:-0}\" \"${requests:-0}\" \"${reading:-0}\" \"${writing:-0}\" \"${waiting:-0}\""
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "nginx.get"),
      name: "Nginx metrics (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    const kids = [
      ["Nginx: worker processes", "nginx.workers", "$.workers", "UNSIGNED", ""],
      ["Nginx: active connections", "nginx.active", "$.active", "UNSIGNED", ""],
      ["Nginx: reading", "nginx.reading", "$.reading", "UNSIGNED", ""],
      ["Nginx: writing", "nginx.writing", "$.writing", "UNSIGNED", ""],
      ["Nginx: waiting", "nginx.waiting", "$.waiting", "UNSIGNED", ""]
    ];
    kids.forEach((k) => {
      items.push(depItem({
        uuid: uuid(tname, k[1]),
        name: k[0],
        key: k[1],
        master: masterKey,
        jsonpath: k[2],
        value_type: k[3],
        units: k[4],
        tags: tag("application")
      }));
    });
    items.find((i) => i.key === "nginx.workers").triggers = [
      trigger({
        uuid: uuid(tname, "trig.nginx"),
        expression: "last(/" + tname + "/nginx.workers)=0",
        name: "Nginx läuft nicht",
        priority: "HIGH"
      })
    ];
  }

  function addApache(items, tname, cfg) {
    const key = sshKey("apache.workers", cfg);
    items.push(Object.assign({
      uuid: uuid(tname, "apache.workers"),
      name: "Apache / httpd processes",
      key: key,
      delay: "1m",
      value_type: "UNSIGNED",
      params: "echo $(( $(ps -C apache2 --no-headers 2>/dev/null | wc -l) + $(ps -C httpd --no-headers 2>/dev/null | wc -l) ))",
      description: "Summe apache2 + httpd Prozesse.",
      tags: tag("application"),
      triggers: [
        trigger({
          uuid: uuid(tname, "trig.apache"),
          expression: "last(/" + tname + "/" + key + ")=0",
          name: "Apache/httpd läuft nicht",
          priority: "HIGH"
        })
      ]
    }, sshFields(cfg)));
  }

  function addMysql(items, tname, cfg) {
    const masterKey = sshKey("mysql.get", cfg);
    const script = [
      "proc=$(( $(ps -C mysqld --no-headers 2>/dev/null | wc -l) + $(ps -C mariadbd --no-headers 2>/dev/null | wc -l) ))",
      "ping=0; uptime=0; threads=0; qps=0",
      "if command -v mysqladmin >/dev/null 2>&1; then",
      "  mysqladmin --defaults-extra-file={$MYSQL.CNF} ping 2>/dev/null | grep -q alive && ping=1",
      "  eval $(mysqladmin --defaults-extra-file={$MYSQL.CNF} status 2>/dev/null | awk -F': ' '{",
      "    gsub(/Threads/,\"\");",
      "  }')",
      "  st=$(mysqladmin --defaults-extra-file={$MYSQL.CNF} status 2>/dev/null)",
      "  uptime=$(echo \"$st\" | sed -n 's/.*Uptime: \\([0-9]*\\).*/\\1/p')",
      "  threads=$(echo \"$st\" | sed -n 's/.*Threads: \\([0-9]*\\).*/\\1/p')",
      "  qps=$(echo \"$st\" | sed -n 's/.*Queries per second avg: \\([0-9.]*\\).*/\\1/p')",
      "fi",
      "printf '{\"proc\":%s,\"ping\":%s,\"uptime\":%s,\"threads\":%s,\"qps\":%s}\\n' \\",
      "  \"${proc:-0}\" \"${ping:-0}\" \"${uptime:-0}\" \"${threads:-0}\" \"${qps:-0}\""
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "mysql.get"),
      name: "MySQL / MariaDB metrics (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    [
      ["MySQL processes", "mysql.proc", "$.proc", "UNSIGNED"],
      ["MySQL ping", "mysql.ping", "$.ping", "UNSIGNED"],
      ["MySQL uptime", "mysql.uptime", "$.uptime", "UNSIGNED"],
      ["MySQL threads", "mysql.threads", "$.threads", "UNSIGNED"],
      ["MySQL queries/s avg", "mysql.qps", "$.qps", "FLOAT"]
    ].forEach((k) => {
      items.push(depItem({
        uuid: uuid(tname, k[1]),
        name: k[0],
        key: k[1],
        master: masterKey,
        jsonpath: k[2],
        value_type: k[3],
        units: k[1] === "mysql.uptime" ? "uptime" : "",
        tags: tag("application")
      }));
    });
    items.find((i) => i.key === "mysql.ping").triggers = [
      trigger({
        uuid: uuid(tname, "trig.mysql"),
        expression: "last(/" + tname + "/mysql.proc)=0 or last(/" + tname + "/mysql.ping)=0",
        name: "MySQL/MariaDB ist nicht verfügbar",
        priority: "HIGH"
      })
    ];
  }

  function addPostgres(items, discovery, tname, cfg) {
    const masterKey = sshKey("pgsql.get", cfg);
    const script = [
      "proc=$(ps -C postgres --no-headers 2>/dev/null | wc -l)",
      "echo '{\"proc\":'\"$proc\"',\"databases\":['",
      "if command -v psql >/dev/null 2>&1; then",
      "  psql -At -c \"select datname, pg_database_size(datname), numbackends from pg_stat_database where datname not in ('template0','template1')\" 2>/dev/null | awk -F'|' '{",
      "    if (n++) printf \",\";",
      "    printf \"{\\\"db\\\":\\\"%s\\\",\\\"size\\\":%s,\\\"backends\\\":%s}\", $1, $2, $3",
      "  }'",
      "fi",
      "echo ']}'"
    ].join("\n");

    items.push(Object.assign({
      uuid: uuid(tname, "pgsql.get"),
      name: "PostgreSQL metrics (master)",
      key: masterKey,
      delay: "1m",
      history: "1d",
      trends: "0",
      value_type: "TEXT",
      params: script,
      preprocessing: [{ type: "CHECK_JSON_ERROR", parameters: ["1"] }],
      tags: tag("raw")
    }, sshFields(cfg)));

    items.push(depItem({
      uuid: uuid(tname, "pgsql.proc"),
      name: "PostgreSQL processes",
      key: "pgsql.proc",
      master: masterKey,
      jsonpath: "$.proc",
      value_type: "UNSIGNED",
      tags: tag("application"),
      triggers: [
        trigger({
          uuid: uuid(tname, "trig.pg"),
          expression: "last(/" + tname + "/pgsql.proc)=0",
          name: "PostgreSQL läuft nicht",
          priority: "HIGH"
        })
      ]
    }));

    discovery.push({
      uuid: uuid(tname, "pgsql.db.discovery"),
      name: "PostgreSQL database discovery",
      type: "DEPENDENT",
      key: "pgsql.db.discovery",
      delay: "0",
      lifetime: "30d",
      master_item: { key: masterKey },
      preprocessing: [
        { type: "JSONPATH", parameters: ["$.databases"] },
        { type: "DISCARD_UNCHANGED_HEARTBEAT", parameters: ["1h"] }
      ],
      lld_macro_paths: [{ lld_macro: "{#DBNAME}", path: "$.db" }],
      item_prototypes: [
        {
          uuid: uuid(tname, "proto.pg.size"),
          name: "PostgreSQL DB [{#DBNAME}]: size",
          type: "DEPENDENT",
          key: "pgsql.db.size[{#DBNAME}]",
          value_type: "UNSIGNED",
          units: "B",
          master_item: { key: masterKey },
          preprocessing: [
            { type: "JSONPATH", parameters: ["$.databases[?(@.db=='{#DBNAME}')].size.first()"] }
          ],
          tags: tag("application")
        },
        {
          uuid: uuid(tname, "proto.pg.conn"),
          name: "PostgreSQL DB [{#DBNAME}]: backends",
          type: "DEPENDENT",
          key: "pgsql.db.backends[{#DBNAME}]",
          value_type: "UNSIGNED",
          master_item: { key: masterKey },
          preprocessing: [
            { type: "JSONPATH", parameters: ["$.databases[?(@.db=='{#DBNAME}')].backends.first()"] }
          ],
          tags: tag("application")
        }
      ]
    });
  }

  function addCustom(items, tname, cfg, row, idx) {
    const desc = slug(row.name) + "." + idx;
    const key = sshKey(desc, cfg);
    const valueType = (row.value_type || "TEXT").toUpperCase();
    const item = Object.assign({
      uuid: uuid(tname, "custom." + desc),
      name: row.name,
      key: key,
      delay: row.delay || cfg.interval || "1m",
      value_type: valueType,
      params: row.command,
      description: row.description || "Benutzerdefiniertes SSH-Item",
      tags: tag("custom")
    }, sshFields(cfg));
    if (row.units) item.units = row.units;
    if (valueType === "TEXT" || valueType === "CHAR" || valueType === "LOG") item.trends = "0";
    if (row.trigger_expr) {
      item.triggers = [
        trigger({
          uuid: uuid(tname, "trig.custom." + desc),
          expression: row.trigger_expr.replaceAll("{ITEM}", "/" + tname + "/" + key),
          name: row.trigger_name || (row.name + " Problem"),
          priority: row.priority || "WARNING"
        })
      ];
    }
    items.push(item);
  }

  return { build, detectModules, parseProcesses };
})();
