// ============================================
// DATABASE - Load from data.json
// ============================================
let eventIDs = []; // Will be populated by fetch

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
// LOAD DATA FROM JSON & INITIALIZE
// ============================================
async function initializeApp() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Failed to load data.json: ${response.status}`);
        }
        eventIDs = await response.json();
        renderCards(eventIDs);
    } catch (error) {
        console.error('Error loading event IDs:', error);
        eventGrid.innerHTML = '<p style="color: #ff4444;">❌ Failed to load event database. Check console.</p>';
    }
}

// Initialize when page loads
initializeApp();