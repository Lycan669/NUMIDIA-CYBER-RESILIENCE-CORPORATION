\# 📊 EVENT LOGS DATABASE



Base de données complète et annotée de tous les Event IDs Windows importants pour le SOC.



\## 📋 Structure



\### Security Events

\- 4624: Successful Logon ⭐

\- 4625: Failed Logon ⭐

\- 4688: Process Creation

\- 4698: Scheduled Task Created

\- \[... plus ...]



\### Sysmon Events

\- 1: Process Creation

\- 3: Network Connection

\- 11: File Created

\- 22: DNS Query

\- \[... plus ...]



\## 🎯 Format de chaque fichier



Chaque fichier suit le template:

1\. Vue d'ensemble

2\. Définition

3\. Structure \& champs clés

4\. Quand est-il généré?

5\. Faux positifs courants

6\. Signes de malveillance

7\. MITRE ATT\&CK

8\. Requêtes Splunk

9\. Requêtes KQL Sentinel

10\. Cas réels d'analyse



\## 🚀 Quick Start



```bash

\# Lire un event ID

cat Security-Events/4624-Successful-Logon.md



\# Chercher un event ID spécifique

grep -r "LogonType" Security-Events/

