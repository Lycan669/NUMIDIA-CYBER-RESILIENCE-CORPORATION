

\# 🚨 QUICK REFERENCE - Event IDs à connaître



\## 🔴 CRITICAL (Alert immédiatement)



| Event ID | Nom | Raison | Action |

|----------|-----|--------|--------|

| 4625 x10+ | Brute Force | Password attack | Block IP + investigate |

| 4624 (RDP) | After-hours logon | Suspicious access | Validate with user |

| 4688 | PowerShell encoded | Potential malware | Analyze command line |

| 1102 | Log cleared | Cover up tracks | ESCALATE |



\## 🟠 HIGH (Investiguer rapidement)



| Event ID | Nom | Pattern |

|----------|-----|---------|

| 4624 Type 3 | External network logon | LogonType=3 + External IP |

| 4698 | Scheduled task created | Uncommon schedule times |

| 4720 | User created | Rogue admin account? |



\## 🟡 MEDIUM (Investiguer)



| Event ID | Nom | Pattern |

|----------|-----|---------|

| 4732 | Group member added | Added to Domain Admins? |

| 5140 | Network share accessed | Access from external? |



\---



\## ⚡ Requêtes Splunk rapides



\### Brute Force

```spl

index=windows EventCode=4625 | stats count by TargetUserName, SourceNetworkAddress | where count >= 10

RDP hors heures

index=windows EventCode=4624 LogonType=10 | eval hour=strftime(\_time, "%H") | where hour < 6 OR hour > 22

Log cleared

index=windows EventCode=1102 | table \_time, Computer, SubjectUserName



🔷 Requêtes KQL rapides

Brute Force

SecurityEvent

| where EventID == 4625

| summarize count() by Account, IpAddress

| where count\_ >= 10

RDP anormal

SecurityEvent

| where EventID == 4624 and LogonType == 10

| extend hour = datetime\_part("hour", TimeGenerated)

| where hour < 6 or hour > 22



\---



\### \*\*ÉTAPE 6: Créer INDEX-BY-TACTIC.md\*\*



```bash

touch 02B-EVENT-LOGS-DATABASE/INDEX-BY-TACTIC.md

\# 📑 INDEX BY MITRE ATT\&CK TACTIC



\## 🚀 Initial Access

\- \[4624 - Logon Type 3 (Network)](./Security-Events/4624-Successful-Logon.md#logon-type-3)



\## 🔑 Credential Access

\- \[4625 - Brute Force](./Security-Events/4625-Failed-Logon.md#brute-force)

\- \[4625 - Password Spraying](./Security-Events/4625-Failed-Logon.md#password-spraying)



\## 🏃 Execution

\- \[4688 - Process Creation](./Security-Events/4688-Process-Creation.md)

\- \[4104 - PowerShell Script Block](./Security-Events/4104-PowerShell-Script-Block.md)



\## 🚪 Persistence

\- \[4698 - Scheduled Task Created](./Security-Events/4698-Scheduled-Task-Created.md)

\- \[4720 - User Account Created](./Security-Events/4720-User-Account-Created.md)



\## 🔁 Lateral Movement

\- \[4624 LogonType 3 - SMB](./Security-Events/4624-Successful-Logon.md#logon-type-3)

\- \[5140 - Network Share Access](./Security-Events/5140-Network-Share-Accessed.md)



\## 📊 Discovery

\- \[4688 - Net/Enum commands](./Security-Events/4688-Process-Creation.md#discovery)



\## 🚨 Defense Evasion

\- \[1102 - Log Cleared](./Security-Events/1102-Audit-Log-Cleared.md)

\- \[4817 - Auditing Settings Changed](./Security-Events/4817-Auditing-Settings-Changed.md)

