import{d as e,f as t,h as n,t as r}from"./button-B34NcmUU.js";import{n as i}from"./dist-ZbZWZ6Be.js";import{t as a}from"./createLucideIcon-C9vmrNLq.js";import{t as o}from"./check-yFGN1BDD.js";import{n as s,r as c,t as l}from"./card-CajmScaf.js";var u=a(`copy`,[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]),d=n(t()),f=`# PwnWächter — Fine-Grained Password Policy für kompromittierte Identitäten
# Auf einem Domain Controller oder mit RSAT als Domain-Admin ausführen.

$GroupName = "PwnWaechter-Pwned"
$PSOName   = "PSO-PwnWaechter-Elevated"

if (-not (Get-ADGroup -Filter "Name -eq '$GroupName'" -ErrorAction SilentlyContinue)) {
  New-ADGroup -Name $GroupName -GroupScope Global -GroupCategory Security \`
    -Path "CN=Users,DC=adlerwerk,DC=local" \`
    -Description "Identitäten, die in Have I Been Pwned auftauchen. PSO greift automatisch."
}

New-ADFineGrainedPasswordPolicy -Name $PSOName \`
  -Precedence 10 \`
  -MinPasswordLength 16 \`
  -PasswordHistoryCount 24 \`
  -MinPasswordAge "1.00:00:00" \`
  -MaxPasswordAge "30.00:00:00" \`
  -LockoutDuration "00:30:00" \`
  -LockoutObservationWindow "00:30:00" \`
  -LockoutThreshold 5 \`
  -ComplexityEnabled $true \`
  -ReversibleEncryptionEnabled $false \`
  -ProtectedFromAccidentalDeletion $true

Add-ADFineGrainedPasswordPolicySubject -Identity $PSOName -Subjects $GroupName
Write-Host "PSO $PSOName ist mit Gruppe $GroupName verknüpft."
`,p=`# PwnWächter — HIBP-Abgleich (geplanter Task, z. B. stündlich)
# Benötigt: HIBP-API-Schlüssel (https://haveibeenpwned.com/API/Key)
# Setzt Mitglieder der Gruppe PwnWaechter-Pwned anhand der HIBP-Kontoabfrage.

$ApiKey    = $env:HIBP_API_KEY
$GroupName = "PwnWaechter-Pwned"
$UserAgent = "PwnWaechter-DC/1.0"
$Headers   = @{ "hibp-api-key" = $ApiKey; "User-Agent" = $UserAgent }

$users = Get-ADUser -Filter {Enabled -eq $true} -Properties mail, userPrincipalName
$pwned = @()

foreach ($u in $users) {
  $account = if ($u.mail) { $u.mail } else { $u.userPrincipalName }
  if (-not $account) { continue }

  try {
    $uri = "https://haveibeenpwned.com/api/v3/breachedaccount/$([uri]::EscapeDataString($account))?truncateResponse=true"
    $null = Invoke-RestMethod -Uri $uri -Headers $Headers -Method Get
    $pwned += $u
    Write-Host "PWNED  $($u.SamAccountName)  $account"
  } catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($resp -and [int]$resp.StatusCode -eq 404) {
      Write-Host "CLEAN  $($u.SamAccountName)"
    } else {
      Write-Warning "Fehler bei $account : $_"
    }
  }
  Start-Sleep -Milliseconds 1600  # HIBP Rate-Limit
}

$group = Get-ADGroup $GroupName
$current = Get-ADGroupMember $group | Select-Object -ExpandProperty distinguishedName

foreach ($u in $pwned) {
  if ($current -notcontains $u.DistinguishedName) {
    Add-ADGroupMember -Identity $group -Members $u
  }
}
foreach ($dn in $current) {
  if ($pwned.DistinguishedName -notcontains $dn) {
    Remove-ADGroupMember -Identity $group -Members $dn -Confirm:$false
  }
}

Write-Host ("Fertig. {0} Identitäten in der erhöhten Richtlinie." -f $pwned.Count)
`,m=`# Pwned-Passwort-Filter auf dem Domain Controller
#
# Fine-Grained Password Policies können LÄNGE und Komplexität pro Gruppe
# erzwingen — aber NICHT, ob das neue Passwort in Have I Been Pwned steht.
# Dafür braucht der DC einen Password Filter (LSA Notification Package):
#
#   1. Lithnet Password Protection  (empfohlen, nutzt HIBP-Hashes lokal)
#      https://github.com/lithnet/ad-password-protection
#   2. Enzoic for Active Directory
#   3. Azure AD Password Protection (für Hybrid)
#
# PwnWächter orchestriert die identitätsbezogene Richtlinie (PSO) und prüft
# im Simulator beides: Name in HIBP → Richtlinie anheben, Passwort in HIBP → ablehnen.
#
# Nach Installation des nativen Filters:
#   HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Notification Packages
# muss den Filternamen enthalten. Danach DC neu starten.
`,h=e();function g(){return(0,h.jsxs)(`div`,{children:[(0,h.jsx)(c,{kicker:`Windows Server`,title:`Bereitstellung`,description:`Diese Konsole ist die Schaltzentrale und der Simulator. Auf einem echten Domain Controller übernimmt eine Fine-Grained Password Policy die erhöhten Anforderungen — und ein nativer Password Filter die Pwned-Passwort-Sperre.`}),(0,h.jsxs)(`ol`,{className:`mb-6 space-y-4`,children:[(0,h.jsx)(_,{n:`1`,title:`Gruppe + PSO`,children:`Konten, deren Name in Have I Been Pwned steht, kommen in die Gruppe PwnWaechter-Pwned. Die verknüpfte PSO hebt Länge, Komplexität und Höchstalter nur für diese Konten an — der Rest der Domäne bleibt unangetastet.`}),(0,h.jsx)(_,{n:`2`,title:`Geplanter HIBP-Abgleich`,children:`Ein Scheduled Task auf dem DC (oder einem Management-Host mit RSAT) fragt die HIBP-Konto-API ab und pflegt die Gruppenmitgliedschaft. Ohne API-Schlüssel arbeitet PwnWächter hier im Simulator mit einem lokalen Katalog.`}),(0,h.jsx)(_,{n:`3`,title:`Password Filter für geleakte Passwörter`,children:`PSOs können nicht prüfen, ob das neue Passwort selbst in Leaks steckt. Dafür ein LSA Notification Package (z. B. Lithnet Password Protection) mit lokalem HIBP-Hashkatalog.`})]}),(0,h.jsxs)(`div`,{className:`space-y-4`,children:[(0,h.jsx)(v,{title:`PSO anlegen`,code:f}),(0,h.jsx)(v,{title:`HIBP-Abgleich (Scheduled Task)`,code:p}),(0,h.jsx)(v,{title:`Hinweis Password Filter`,code:m})]})]})}function _({n:e,title:t,children:n}){return(0,h.jsxs)(`li`,{className:`flex gap-4`,children:[(0,h.jsx)(`span`,{className:`flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated font-mono text-xs text-steel`,children:e}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{className:`text-sm font-medium`,children:t}),(0,h.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:n})]})]})}function v({title:e,code:t}){let[n,a]=(0,d.useState)(!1);return(0,h.jsx)(l,{children:(0,h.jsxs)(s,{children:[(0,h.jsxs)(`div`,{className:`mb-3 flex items-center justify-between gap-3`,children:[(0,h.jsx)(`p`,{className:`text-sm font-medium`,children:e}),(0,h.jsxs)(r,{variant:`outline`,size:`sm`,onClick:async()=>{try{await navigator.clipboard.writeText(t),a(!0),i.success(`Kopiert.`),setTimeout(()=>a(!1),1600)}catch{i.error(`Kopieren nicht möglich — Text markieren.`)}},children:[n?(0,h.jsx)(o,{className:`size-4`}):(0,h.jsx)(u,{className:`size-4`}),n?`Kopiert`:`Kopieren`]})]}),(0,h.jsx)(`pre`,{className:`max-h-80 overflow-auto rounded-md bg-bg p-4 font-mono text-[0.75rem] leading-relaxed text-fg whitespace-pre-wrap`,children:t})]})})}export{g as component};