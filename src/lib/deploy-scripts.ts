export const PS_CREATE_PSO = `# PwnWächter — Fine-Grained Password Policy für kompromittierte Identitäten
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
`;

export const PS_HIBP_SYNC = `# PwnWächter — HIBP-Abgleich (geplanter Task, z. B. stündlich)
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
`;

export const PS_PASSWORD_FILTER_NOTE = `# Pwned-Passwort-Filter auf dem Domain Controller
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
`;
