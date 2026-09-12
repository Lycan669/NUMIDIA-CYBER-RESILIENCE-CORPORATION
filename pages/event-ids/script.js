// ============================================
// DATABASE - Windows Event IDs
// ============================================
const eventIDs = [
    {
        id: 4624,
        title: "Successful Logon",
        category: "logon",
        severity: "info",
        description: "An account was successfully logged on.",
        details: "Generated when a logon session is created. Check Logon Type to understand the context (2=Interactive, 3=Network, 10=RemoteInteractive/RDP).",
        mitre: ["T1078"],
        falsePositives: "Normal user activity, scheduled tasks, service accounts logging in routinely.",
        detection: "Baseline normal logon patterns per user. Alert on Logon Type 10 (RDP) from unusual source IPs or outside business hours.",
        splQuery: `index=windows EventCode=4624\n| stats count by Account_Name, Logon_Type, Source_Network_Address\n| where Logon_Type=10`,
        kqlQuery: `SecurityEvent\n| where EventID == 4624\n| where LogonType == 10\n| summarize count() by Account, IpAddress`
    },
    {
        id: 4625,
        title: "Failed Logon",
        category: "logon",
        severity: "medium",
        description: "An account failed to log on.",
        details: "Multiple 4625 events from the same source in a short time window may indicate brute force or password spraying.",
        mitre: ["T1110", "T1110.001", "T1110.003"],
        falsePositives: "User mistyping password, expired credentials, locked accounts, misconfigured services.",
        detection: "Alert on threshold: >10 failed logons in 5 minutes from same source IP. Compare unique usernames vs unique source IPs to distinguish brute force from password spraying.",
        splQuery: `index=windows EventCode=4625\n| stats count, dc(Account_Name) as unique_users by Source_Network_Address\n| where count > 10`,
        kqlQuery: `SecurityEvent\n| where EventID == 4625\n| summarize FailedCount=count(), UniqueUsers=dcount(Account) by IpAddress\n| where FailedCount > 10`
    },
    {
        id: 4688,
        title: "Process Creation",
        category: "process",
        severity: "medium",
        description: "A new process has been created.",
        details: "Requires 'Audit Process Creation' policy enabled. Command line auditing must be enabled separately to see full command arguments.",
        mitre: ["T1059", "T1036.005"],
        falsePositives: "Normal software execution, scheduled tasks, legitimate admin scripts.",
        detection: "Look for suspicious parent-child relationships (e.g., WINWORD.EXE spawning powershell.exe/cmd.exe). Watch for processes running from unusual paths (Temp, AppData).",
        splQuery: `index=windows EventCode=4688\n| where match(New_Process_Name, "powershell.exe")\n| where match(Creator_Process_Name, "WINWORD.EXE|EXCEL.EXE")\n| table _time, Account_Name, Creator_Process_Name, New_Process_Name, Process_Command_Line`,
        kqlQuery: `DeviceProcessEvents\n| where InitiatingProcessFileName =~ "WINWORD.EXE"\n| where FileName =~ "powershell.exe"\n| project Timestamp, DeviceName, AccountName, ProcessCommandLine`
    },
    {
        id: 4104,
        title: "PowerShell Script Block Logging",
        category: "powershell",
        severity: "high",
        description: "Execution of a remote command or PowerShell script block was logged.",
        details: "Captures the full content of PowerShell scripts, even obfuscated ones (after deobfuscation). Critical for detecting fileless malware and living-off-the-land attacks.",
        mitre: ["T1059.001"],
        falsePositives: "Legitimate admin scripts, automation tools, Group Policy scripts, Exchange/SCCM management scripts.",
        detection: "Search for suspicious keywords: IEX, DownloadString, EncodedCommand, Invoke-Expression, -nop, -w hidden, bypass. Correlate with parent process and user context.",
        splQuery: `index=windows EventCode=4104\n| search ScriptBlockText="*IEX*" OR ScriptBlockText="*DownloadString*" OR ScriptBlockText="*EncodedCommand*"\n| table _time, Computer, User, ScriptBlockText`,
        kqlQuery: `DeviceEvents\n| where ActionType == "PowerShellCommand"\n| where AdditionalFields has_any ("DownloadString", "IEX", "EncodedCommand")\n| project Timestamp, DeviceName, AccountName, AdditionalFields`
    },
    {
        id: 1102,
        title: "Security Log Cleared",
        category: "log",
        severity: "critical",
        description: "The audit log was cleared.",
        details: "One of the strongest indicators of malicious activity - attackers clear logs to cover their tracks after achieving objectives.",
        mitre: ["T1070.001"],
        falsePositives: "Legitimate log rotation/maintenance by administrators (rare, should always be verified).",
        detection: "This event should ALWAYS trigger immediate investigation. Correlate with who cleared it and what activity occurred just before clearing.",
        splQuery: `index=windows EventCode=1102\n| table _time, Computer, Account_Name, Subject_User_Name`,
        kqlQuery: `SecurityEvent\n| where EventID == 1102\n| project TimeGenerated, Computer, Account, SubjectUserName`
    },
    {
        id: 4672,
        title: "Special Privileges Assigned to New Logon",
        category: "account",
        severity: "medium",
        description: "Admin-equivalent privileges assigned at logon (SeDebugPrivilege, SeBackupPrivilege, etc).",
        details: "Occurs alongside 4624 when an account logs on with administrative rights. Useful to track privileged account usage.",
        mitre: ["T1078.002"],
        falsePositives: "Normal admin activity, service accounts with elevated rights.",
        detection: "Baseline which accounts normally get this event. Alert on new/unusual accounts receiving special privileges.",
        splQuery: `index=windows EventCode=4672\n| stats count by Account_Name\n| sort -count`,
        kqlQuery: `SecurityEvent\n| where EventID == 4672\n| summarize count() by Account`
    },
    {
        id: 4698,
        title: "Scheduled Task Created",
        category: "persistence",
        severity: "high",
        description: "A scheduled task was created.",
        details: "Common persistence mechanism used by attackers to maintain access or execute payloads at specific times/triggers.",
        mitre: ["T1053.005"],
        falsePositives: "Software installers, Windows Updates, legitimate IT automation.",
        detection: "Inspect task command/action for suspicious executables, scripts, or encoded commands. Watch for tasks created by non-admin accounts or from unusual processes.",
        splQuery: `index=windows EventCode=4698\n| table _time, Computer, Account_Name, Task_Name, Command`,
        kqlQuery: `SecurityEvent\n| where EventID == 4698\n| project TimeGenerated, Computer, Account, TaskName`
    },
    {
        id: 4720,
        title: "User Account Created",
        category: "account",
        severity: "medium",
        description: "A new user account was created.",
        details: "Attackers create accounts for persistence after initial compromise, often with generic or admin-like names.",
        mitre: ["T1136.001"],
        falsePositives: "Normal IT onboarding activity.",
        detection: "Correlate with who created the account (SubjectUserName) and if it happened outside normal IT provisioning workflows/hours.",
        splQuery: `index=windows EventCode=4720\n| table _time, Account_Name, Subject_Account_Name`,
        kqlQuery: `SecurityEvent\n| where EventID == 4720\n| project TimeGenerated, TargetAccount=Account, SubjectUserName`
    },
    {
        id: 4732,
        title: "Member Added to Security-Enabled Local Group",
        category: "account",
        severity: "high",
        description: "A member was added to a local security group (e.g., Administrators).",
        details: "Critical for detecting privilege escalation - attacker adding compromised account to local admin group.",
        mitre: ["T1098"],
        falsePositives: "Legitimate IT admin adding users to groups for authorized purposes.",
        detection: "Alert specifically when group name = 'Administrators' or 'Remote Desktop Users'. Correlate with the account performing the action.",
        splQuery: `index=windows EventCode=4732 Group_Name="Administrators"\n| table _time, Account_Name, Group_Name, Subject_Account_Name`,
        kqlQuery: `SecurityEvent\n| where EventID == 4732\n| where TargetUserName has "Administrators"\n| project TimeGenerated, MemberName, SubjectUserName`
    },
    {
        id: 5140,
        title: "Network Share Object Accessed",
        category: "network",
        severity: "medium",
        description: "A network share object was accessed (SMB access).",
        details: "Useful for detecting lateral movement via SMB/admin shares (C$, ADMIN$, IPC$).",
        mitre: ["T1021.002"],
        falsePositives: "Normal file share access, backup software, legitimate admin activity.",
        detection: "Watch for access to administrative shares (C$, ADMIN$) from workstation-to-workstation (not from servers), which is atypical.",
        splQuery: `index=windows EventCode=5140\n| where match(Share_Name, "ADMIN\\$|C\\$|IPC\\$")\n| table _time, Account_Name, Source_Address, Share_Name`,
        kqlQuery: `SecurityEvent\n| where EventID == 5140\n| where ShareName has_any ("ADMIN$", "C$", "IPC$")\n| project TimeGenerated, Account, IpAddress, ShareName`
    },
    {
        id: "Sysmon-1",
        title: "Sysmon: Process Creation",
        category: "sysmon",
        severity: "medium",
        description: "Sysmon logs detailed process creation events with hashes, command lines, and parent processes.",
        details: "Much richer than 4688 - includes file hash (SHA256), full command line, parent process GUID for chaining, and integrity level.",
        mitre: ["T1059"],
        falsePositives: "Depends heavily on context - most process creations are legitimate.",
        detection: "Build parent-child process trees. Flag unusual chains like office apps spawning shells, or LOLBins (certutil, mshta, regsvr32) with network activity.",
        splQuery: `index=sysmon EventCode=1\n| table _time, Computer, Image, ParentImage, CommandLine, Hashes`,
        kqlQuery: `DeviceProcessEvents\n| project Timestamp, DeviceName, FileName, InitiatingProcessFileName, ProcessCommandLine, SHA256`
    },
    {
        id: "Sysmon-3",
        title: "Sysmon: Network Connection",
        category: "sysmon",
        severity: "medium",
        description: "Sysmon logs network connections made by processes.",
        details: "Provides source/destination IP, port, and the initiating process. Essential for detecting C2 beaconing and data exfiltration.",
        mitre: ["T1071", "T1041"],
        falsePositives: "Vast majority of network connections are legitimate (browsers, updates, cloud sync).",
        detection: "Look for regular time-interval connections (beaconing pattern) from unusual processes, or connections to rare/newly-seen external IPs.",
        splQuery: `index=sysmon EventCode=3\n| stats count by Image, DestinationIp, DestinationPort\n| where count > 50`,
        kqlQuery: `DeviceNetworkEvents\n| summarize count() by InitiatingProcessFileName, RemoteIP, RemotePort\n| where count_ > 50`
    },
    {
        id: "Sysmon-11",
        title: "Sysmon: File Creation",
        category: "sysmon",
        severity: "low",
        description: "Sysmon logs file creation/overwrite events.",
        details: "Useful for tracking dropped payloads, especially in Temp, AppData, or Startup folders.",
        mitre: ["T1105"],
        falsePositives: "Normal file operations - browsers, downloads, software installs.",
        detection: "Focus on executable files (.exe, .dll, .ps1) created in unusual locations (Temp, AppData\\Roaming, Startup folder).",
        splQuery: `index=sysmon EventCode=11\n| where match(TargetFilename, "\\\\Temp\\\\.*\\.(exe|dll|ps1)$")\n| table _time, Computer, Image, TargetFilename`,
        kqlQuery: `DeviceFileEvents\n| where FolderPath has_any ("Temp", "AppData\\\\Roaming")\n| where FileName endswith ".exe" or FileName endswith ".ps1"\n| project Timestamp, DeviceName, FileName, FolderPath, InitiatingProcessFileName`
    },
    {
        id: "Sysmon-22",
        title: "Sysmon: DNS Query",
        category: "sysmon",
        severity: "medium",
        description: "Sysmon logs DNS queries made by processes.",
        details: "Requires Sysmon v13+. Critical for detecting DGA (Domain Generation Algorithm) malware, DNS tunneling, and C2 domain resolution.",
        mitre: ["T1071.004", "T1568.002"],
        falsePositives: "Most DNS queries are legitimate application/browser activity.",
        detection: "Flag high-entropy/random-looking domain names, newly registered domains, or unusually high volume of DNS queries from a single process (possible tunneling).",
        splQuery: `index=sysmon EventCode=22\n| stats count by Image, QueryName\n| where count > 100`,
        kqlQuery: `DeviceEvents\n| where ActionType == "DnsQuery"\n| summarize count() by InitiatingProcessFileName, AdditionalFields\n| where count_ > 100`
    }
];

// ============================================
// RENDER FUNCTIONS
// ============================================
const eventGrid = document.getElementById('eventGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resultCount = document.getElementById('resultCount');
const noResults = document.getElementById('noResults');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function renderCards(data) {
    eventGrid.innerHTML = '';
    resultCount.textContent = data.length;

    if (data.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    noResults.style.display = 'none';

    data.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-card-header">
                <span class="event-id-number" style="color:${getSeverityColor(event.severity)}">${event.id}</span>
                <span class="severity-badge severity-${event.severity}">${event.severity}</span>
            </div>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description}</p>
            <div class="event-mitre">
                ${event.mitre.map(t => `<span class="mitre-tag">${t}</span>`).join('')}
            </div>
        `;
        card.addEventListener('click', () => openModal(event));
        eventGrid.appendChild(card);
    });
}

function getSeverityColor(sev) {
    const colors = {
        info: '#00d9ff',
        low: '#00ff41',
        medium: '#ffa500',
        high: '#ff4444',
        critical: '#ff0000'
    };
    return colors[sev] || '#fff';
}

function openModal(event) {
    modalBody.innerHTML = `
        <h2>${event.id} - ${event.title}</h2>
        <span class="severity-badge severity-${event.severity}">${event.severity}</span>
        
        <div class="modal-section">
            <h3>📝 Description</h3>
            <p>${event.description}</p>
            <p>${event.details}</p>
        </div>

        <div class="modal-section">
            <h3>🎯 MITRE ATT&CK</h3>
            <p>${event.mitre.join(', ')}</p>
        </div>

        <div class="modal-section">
            <h3>⚠️ False Positives</h3>
            <p>${event.falsePositives}</p>
        </div>

        <div class="modal-section">
            <h3>🔍 Detection Strategy</h3>
            <p>${event.detection}</p>
        </div>

        <div class="modal-section">
            <h3>📊 SPL Query (Splunk)</h3>
            <div class="code-block">${event.splQuery}</div>
        </div>

        <div class="modal-section">
            <h3>🔷 KQL Query (Sentinel)</h3>
            <div class="code-block">${event.kqlQuery}</div>
        </div>
    `;
    modal.classList.add('active');
}

modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

// ============================================
// FILTER & SEARCH LOGIC
// ============================================
function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filtered = eventIDs.filter(event => {
        const matchesSearch = 
            event.id.toString().toLowerCase().includes(searchTerm) ||
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm);
        
        const matchesCategory = category === 'all' || event.category === category;

        return matchesSearch && matchesCategory;
    });

    renderCards(filtered);
}

searchInput.addEventListener('input', filterEvents);
categoryFilter.addEventListener('change', filterEvents);

// ============================================
// INITIAL RENDER
// ============================================
renderCards(eventIDs);