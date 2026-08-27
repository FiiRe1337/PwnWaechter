/* Monitoring-Module: SSH-Master + Dependent Child-Items + LLD */
window.ZTG_CATALOG = [
  {
    id: "availability",
    name: "Verfügbarkeit",
    group: "Basis",
    description: "SSH-Port, ICMP-ähnlich via TCP und SSH-Echo (Alive).",
    default: true,
    lld: false
  },
  {
    id: "system",
    name: "Systeminfo",
    group: "Basis",
    description: "Hostname, OS, Kernel, Uptime – ein SSH-Master, Child-Items per JSONPath.",
    default: true,
    lld: false
  },
  {
    id: "cpu",
    name: "CPU & Load",
    group: "Leistung",
    description: "Load Average, CPU-Auslastung und optionale Core-Discovery.",
    default: true,
    lld: true
  },
  {
    id: "memory",
    name: "Arbeitsspeicher & Swap",
    group: "Leistung",
    description: "RAM genutzt/verfügbar, Swap – Dependent Items aus einem Master-JSON.",
    default: true,
    lld: false
  },
  {
    id: "filesystem",
    name: "Dateisysteme",
    group: "Storage",
    description: "LLD aller gemounteten FS inkl. Used%, Inodes und Triggers.",
    default: true,
    lld: true
  },
  {
    id: "disks",
    name: "Block-Devices / Disk I/O",
    group: "Storage",
    description: "LLD von Disks aus /proc/diskstats (reads, writes, util).",
    default: false,
    lld: true
  },
  {
    id: "network",
    name: "Netzwerkschnittstellen",
    group: "Netzwerk",
    description: "LLD von Interfaces inkl. Traffic, Errors, Drops.",
    default: true,
    lld: true
  },
  {
    id: "systemd",
    name: "Systemd Services",
    group: "Dienste",
    description: "LLD laufender/aktivierter Units. Filter über Makros.",
    default: false,
    lld: true
  },
  {
    id: "processes",
    name: "Prozesse",
    group: "Dienste",
    description: "Zählt angegebene Prozesse (z. B. nginx, sshd) per SSH.",
    default: false,
    lld: true
  },
  {
    id: "security",
    name: "Security Basics",
    group: "Sicherheit",
    description: "Checksum /etc/passwd, Failed-Logins, letzte Reboots.",
    default: false,
    lld: false
  },
  {
    id: "docker",
    name: "Docker",
    group: "Container",
    description: "Container-Discovery, Status, CPU/Mem sofern docker CLI vorhanden.",
    default: false,
    lld: true
  },
  {
    id: "nginx",
    name: "Nginx",
    group: "Anwendungen",
    description: "Prozess, optional Stub-Status per curl auf localhost.",
    default: false,
    lld: false
  },
  {
    id: "apache",
    name: "Apache / httpd",
    group: "Anwendungen",
    description: "Prozess-Check und server-status (lokal).",
    default: false,
    lld: false
  },
  {
    id: "mysql",
    name: "MySQL / MariaDB",
    group: "Datenbanken",
    description: "Prozess + mysqladmin status/ping per SSH (lokaler Client).",
    default: false,
    lld: false
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    group: "Datenbanken",
    description: "Prozess + optionale psql-Metriken (Connections, DB-Größe).",
    default: false,
    lld: true
  }
];

window.ZTG_PROFILES = [
  {
    id: "linux",
    name: "Linux Server",
    modules: ["availability", "system", "cpu", "memory", "filesystem", "network"]
  },
  {
    id: "web",
    name: "Webserver",
    modules: ["availability", "system", "cpu", "memory", "filesystem", "network", "nginx", "apache", "processes"]
  },
  {
    id: "db",
    name: "Datenbankserver",
    modules: ["availability", "system", "cpu", "memory", "filesystem", "disks", "mysql", "postgres"]
  },
  {
    id: "container",
    name: "Container-Host",
    modules: ["availability", "system", "cpu", "memory", "filesystem", "network", "docker"]
  },
  {
    id: "full",
    name: "Vollständig",
    modules: [
      "availability", "system", "cpu", "memory", "filesystem", "disks",
      "network", "systemd", "processes", "security", "docker"
    ]
  }
];

window.ZTG_KEYWORD_MAP = [
  { re: /verf[uü]gbar|alive|ping|ssh.?port|erreich/i, id: "availability" },
  { re: /hostname|kernel|uptime|betriebssystem|os\b|systeminfo/i, id: "system" },
  { re: /\bcpu\b|load|last|prozessor|kern(e|el)?\b/i, id: "cpu" },
  { re: /ram|memory|speicher|swap/i, id: "memory" },
  { re: /dateisystem|filesystem|disk space|festplatte|df\b|inode|mount/i, id: "filesystem" },
  { re: /i\/?o|diskstat|block.?dev|smart/i, id: "disks" },
  { re: /netz(werk)?|interface|traffic|nic\b|eth|bandwidth/i, id: "network" },
  { re: /systemd|unit|service.?status/i, id: "systemd" },
  { re: /prozess|process|anzahl.*pid/i, id: "processes" },
  { re: /passwd|security|sicherheit|failed.?login|fail2ban/i, id: "security" },
  { re: /docker|container/i, id: "docker" },
  { re: /nginx/i, id: "nginx" },
  { re: /apache|httpd/i, id: "apache" },
  { re: /mysql|mariadb/i, id: "mysql" },
  { re: /postgres|pgsql/i, id: "postgres" }
];
