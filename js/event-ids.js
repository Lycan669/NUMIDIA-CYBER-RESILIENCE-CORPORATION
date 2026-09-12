// ===== LOAD DATA =====
let allEventIds = [];
let filteredEvents = [];

async function loadEventData() {
    try {
        const response = await fetch('/pages/event-ids/data.json');
        const data = await response.json();
        allEventIds = data.eventIds;
        filteredEvents = allEventIds;
        renderEvents(allEventIds);
        updateStats();
    } catch (error) {
        console.error('Error loading event data:', error);
    }
}

// ===== RENDER EVENTS =====
function renderEvents(events) {
    const grid = document.getElementById('eventsGrid');
    const noResults = document.getElementById('noResults');

    if (events.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        document.getElementById('displayCount').textContent = '0';
        return;
    }

    noResults.style.display = 'none';
    grid.innerHTML = events.map(event => `
        <div class="event-card ${event.severity.toLowerCase()}" onclick="openModal('${event.id}')">
            <div class="event-card-header">
                <div class="event-id">#${event.id}</div>
                <span class="event-severity ${event.severity.toLowerCase()}">${event.severity}</span>
            </div>
            <div class="event-name">${event.name}</div>
            <span class="event-category">${event.category}</span>
            <p class="event-description">${event.description}</p>
            <div class="event-footer">
                <div class="event-mitre">
                    ${event.mitre.slice(0, 2).map(m => `<span class="mitre-tag">${m}</span>`).join('')}
                </div>
                <span class="learn-more">Learn More →</span>
            </div>
        </div>
    `).join('');

    document.getElementById('displayCount').textContent = events.length;
}

// ===== SEARCH & FILTER =====
document.getElementById('searchInput').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.filter;
    const activeSeverity = document.querySelector('.severity-btn.active').dataset.severity;

    document.getElementById('clearBtn').style.display = query ? 'block' : 'none';

    filteredEvents = allEventIds.filter(event => {
        const matchesSearch = 
            event.id.includes(query) ||
            event.name.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.detailedDescription.toLowerCase().includes(query);
        
        const matchesCategory = activeCategory === 'all' || event.category === activeCategory;
        const matchesSeverity = activeSeverity === 'all' || event.severity === activeSeverity;

        return matchesSearch && matchesCategory && matchesSeverity;
    });

    renderEvents(filteredEvents);
});

document.getElementById('clearBtn').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearBtn').style.display = 'none';
    const activeCategory = document.querySelector('.filter-btn.active').dataset.filter;
    const activeSeverity = document.querySelector('.severity-btn.active').dataset.severity;
    
    filteredEvents = allEventIds.filter(event => {
        const matchesCategory = activeCategory === 'all' || event.category === activeCategory;
        const matchesSeverity = activeSeverity === 'all' || event.severity === activeSeverity;
        return matchesCategory && matchesSeverity;
    });

    renderEvents(filteredEvents);
});

// ===== CATEGORY FILTERS =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const query = document.getElementById('searchInput').value.toLowerCase();
        const category = this.dataset.filter;
        const severity = document.querySelector('.severity-btn.active').dataset.severity;

        filteredEvents = allEventIds.filter(event => {
            const matchesSearch = 
                !query || event.id.includes(query) ||
                event.name.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query);
            
            const matchesCategory = category === 'all' || event.category === category;
            const matchesSeverity = severity === 'all' || event.severity === severity;

            return matchesSearch && matchesCategory && matchesSeverity;
        });

        renderEvents(filteredEvents);
    });
});

// ===== SEVERITY FILTERS =====
document.querySelectorAll('.severity-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const query = document.getElementById('searchInput').value.toLowerCase();
        const category = document.querySelector('.filter-btn.active').dataset.filter;
        const severity = this.dataset.severity;

        filteredEvents = allEventIds.filter(event => {
            const matchesSearch = 
                !query || event.id.includes(query) ||
                event.name.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query);
            
            const matchesCategory = category === 'all' || event.category === category;
            const matchesSeverity = severity === 'all' || event.severity === severity;

            return matchesSearch && matchesCategory && matchesSeverity;
        });

        renderEvents(filteredEvents);
    });
});

// ===== MODAL FUNCTIONS =====
function openModal(eventId) {
    const event = allEventIds.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');

    const mitreMappings = event.mitre.map((t, i) => `
        <span class="mitre-tag">${t}: ${event.mitreNames[i]}</span>
    `).join('');

    const relatedEventsHTML = event.relatedEvents && event.relatedEvents.length > 0 ? `
        <div class="modal-section">
            <h3>🔗 Related Events</h3>
            <div class="related-events">
                ${event.relatedEvents.map(id => `
                    <button class="related-event-btn" onclick="openModal('${id}'); return false;">
                        Event ${id}
                    </button>
                `).join('')}
            </div>
        </div>
    ` : '';

    const logonTypesHTML = event.logonTypes ? `
        <div class="modal-section">
            <h3>🔐 Logon Types</h3>
            <ul class="modal-list">
                ${Object.entries(event.logonTypes).map(([type, desc]) => `
                    <li><strong>Type ${type}:</strong> ${desc}</li>
                `).join('')}
            </ul>
        </div>
    ` : '';

    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-title">
                <h2>Event #${event.id}</h2>
                <p>${event.name}</p>
            </div>
            <span class="event-severity ${event.severity.toLowerCase()}">${event.severity}</span>
        </div>

        <div class="modal-section">
            <h3>📋 Description</h3>
            <p>${event.detailedDescription}</p>
        </div>

        <div class="modal-section">
            <h3>🏷️ Category</h3>
            <p>${event.category} > ${event.subcategory}</p>
        </div>

        ${logonTypesHTML}

        <div class="modal-section">
            <h3>🔑 Key Fields</h3>
            <ul class="modal-list">
                ${event.keyFields.map(field => `<li>${field}</li>`).join('')}
            </ul>
        </div>

        <div class="modal-section">
            <h3>⚔️ MITRE ATT&CK Mapping</h3>
            <div class="related-events">
                ${mitreMappings}
            </div>
        </div>

        <div class="modal-section">
            <h3>🎯 Detection Strategy</h3>
            <p>${event.detectionStrategy}</p>
        </div>

        <div class="modal-section">
            <h3>⚠️ Red Flags</h3>
            <ul class="modal-list">
                ${event.redFlags.map(flag => `<li>${flag}</li>`).join('')}
            </ul>
        </div>

        <div class="modal-section">
            <h3>✅ False Positives</h3>
            <ul class="modal-list">
                ${event.falsePositives.map(fp => `<li>${fp}</li>`).join('')}
            </ul>
        </div>

        <div class="modal-section">
            <h3>🔍 Splunk Query</h3>
            <div class="query-block">
                <span class="query-label">Splunk SPL</span>
                <pre class="query-code">${event.queries.splunk}</pre>
                <button class="copy-btn" onclick="copyToClipboard('${event.queries.splunk.replace(/'/g, "\\'")}')">📋 Copy</button>
            </div>
        </div>

        <div class="modal-section">
            <h3>🔍 KQL Query</h3>
            <div class="query-block">
                <span class="query-label">Microsoft Sentinel KQL</span>
                <pre class="query-code">${event.queries.kql}</pre>
                <button class="copy-btn" onclick="copyToClipboard('${event.queries.kql.replace(/'/g, "\\'")}')">📋 Copy</button>
            </div>
        </div>

        <div class="modal-section">
            <h3>📝 Real-World Example</h3>
            <p>${event.example}</p>
        </div>

        <div class="modal-section">
            <h3>📚 Difficulty Level</h3>
            <p>${event.difficulty}</p>
        </div>

        ${relatedEventsHTML}
    `;

    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('eventModal').classList.remove('show');
}

document.getElementById('closeModal').addEventListener('click', closeModal);

window.addEventListener('click', function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeModal();
    }
});

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Query copied to clipboard!');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
    });
}

// ===== UPDATE STATS =====
function updateStats() {
    const total = allEventIds.length;
    const critical = allEventIds.filter(e => e.severity === 'CRITICAL').length;
    const high = allEventIds.filter(e => e.severity === 'HIGH').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('criticalCount').textContent = critical;
    document.getElementById('highCount').textContent = high;
}

// ===== INIT =====
loadEventData();