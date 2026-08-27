# Zabbix Template Generator

Web-App, die aus einer Beschreibung (Module + Freitext + eigene Befehle) ein **importfähiges Zabbix-YAML-Template** erzeugt.

Überwachung läuft **immer per SSH**. Metriken werden nicht als Dutzend einzelner SSH-Items angelegt, sondern so:

1. **Master-Item** (Typ SSH) holt ein JSON vom Host.
2. **Child-Items** (Typ Dependent) ziehen Einzelwerte per JSONPath.
3. **Discovery-Rules** (Dependent + LLD) legen automatisch Items/Trigger für Dateisysteme, NICs, Services, Container usw. an.

Es wird kein Zabbix-Agent auf dem Zielhost benötigt.

## Start

```bash
cd zabbix-template-generator
python3 server.py
```

Browser: http://127.0.0.1:8765/

Ohne Server kannst du `static/index.html` direkt öffnen.

## In Zabbix nutzen

1. `Data collection → Templates → Import` und die heruntergeladene YAML-Datei wählen.
2. Template an den Host linken.
3. Makros setzen:
   - `{$SSH.USER}`
   - `{$SSH.PORT}` (Standard 22)
   - Key-Auth: `{$SSH.PUBLICKEY}` / `{$SSH.PRIVATEKEY}` (Dateinamen unter `SSHKeyLocation` auf Server/Proxy)
   - oder Passwort-Auth: `{$SSH.PASSWORD}`
4. Warten, bis die Master-Items das erste JSON liefern – danach entstehen die Child-Items durch LLD.

Der Zabbix-Server/Proxy muss mit SSH-Support gebaut sein (`libssh` / `libssh2`).

## Profile

- Linux Server – CPU, RAM, FS, Netz, Verfügbarkeit
- Webserver – plus Nginx/Apache/Prozesse
- Datenbankserver – plus MySQL/PostgreSQL und Disks
- Container-Host – plus Docker-LLD
- Vollständig – fast alle Module

Zusätzlich: eigene SSH-Befehle mit optionalem Trigger. In Triggern steht `{ITEM}` als Platzhalter für den Item-Pfad.

## Hinweise

- Die Shell-Kommandos sind auf typisches GNU/Linux ausgelegt (`awk`, `df`, `findmnt`, `systemctl`, `docker`).
- CPU-Auslastung im Master-JSON ist eine Näherung aus `/proc/stat` (seit Boot), nicht ein 1-Sekunden-Sample.
- Systemd- und Docker-Discovery kann viele Items erzeugen – Filter-Makros (`{$SYSTEMD.NAME.MATCHES}`) nutzen.
- Template-Namen ohne Sonderzeichen halten Trigger-Ausdrücke einfach.
