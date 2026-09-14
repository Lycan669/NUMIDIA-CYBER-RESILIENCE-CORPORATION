\# 🔒 Security Policy



\## Reporting Security Issues



\### ⚠️ Ne PAS créer une Issue publique pour les vulnérabilités !



Si tu découvres une faille de sécurité :



\*\*Email :\*\* security@ton-domaine.com

\*\*Subject :\*\* \[SECURITY] Vulnerability Report



\*\*Ou GitHub Private Report :\*\*

\[Sécurité → Report a vulnerability](../../security/advisories)



\---



\## Ce que tu dois signaler



\- Code vulnerability

\- PII exposée

\- Credentials dans les fichiers

\- Malware détecté

\- Faille logique



\## Format du report



| Champ | Description |

|-------|-------------|

| \*\*Description\*\* | Décris la vulnérabilité |

| \*\*Severity\*\* | Critical / High / Medium / Low |

| \*\*Impact\*\* | Ce que ça affecte |

| \*\*Reproduction\*\* | Étapes pour reproduire |

| \*\*Suggestion\*\* | Correction proposée (optionnel) |



\---



\## Timeline



| Jour | Action |

|------|--------|

| Day 1 | Signalement |

| Day 2-3 | Confirmation |

| Day 5-7 | Correction |

| Day 7 | Publication de la correction |

| Day 8 | Publication de l'advisory |



\---



\## Scope



\### 🟢 IN SCOPE



\- Code vulnerabilities

\- Logic flaws

\- Information disclosure

\- Configuration issues

\- Hardcoded credentials



\### 🔴 OUT OF SCOPE



\- Typos → ouvre une Issue

\- Documentation improvements → ouvre une Issue

\- Feature requests → ouvre une Discussion

\- General security advice



\---



\## Confidentiality



\- ✅ Découverte gardée confidentielle

\- ✅ Pas de publication de ton nom sans permission

\- ✅ Remerciement dans l'advisory



\---



\## Code Security Standards



\### ✅ Autorisé



```python

password = os.getenv('DB\_PASSWORD')



if len(user\_input) > 100:

&#x20;   raise ValueError("Input too long")



try:

&#x20;   result = process\_data(data)

except Exception as e:

&#x20;   logger.error(f"Error: {e}")   

