// ------------------
// Global functions
// ------------------

// Function for capitalicing 1. letter
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// Display wiki entry in wikiPanel
function displayWikiEntry(id) {
    switchTab('mapTab');
    const wikiContainer = document.getElementById('wikiText');

    fetch('wikiData.json')
        .then (response => {
            if (!response.ok) throw new Error("Failed fetching database");
            return response.json();
        })
        .then(data => {
            let entry = null;                               // Search all category blocks
            for (const category in data) {
                if (data[category] && data[category][id]) {
                    entry = data[category][id];
                    break;
                }
            }

            if (entry) {

                const descriptionHtml = Array.isArray(entry.description)
                ? entry.description.map(paragraph => `<p>${paragraph}</p>`).join('')
                : `<p>${entry.description}</p>`;

                wikiContainer.innerHTML = `
                <h2><span class="nf-fae-planet"></span> &nbsp; ${entry.title}</h2>
                <hr>
                <p><strong> &nbsp; Aliases: &nbsp; </strong> ${entry.aliases}</p>
                <p><strong> &nbsp; Type: &nbsp; </strong> ${entry.type}</p>
                <hr>
                <div class="description-content">
                    ${descriptionHtml}
                </div>
                <hr>
                <a href="entry.html?file=${encodeURIComponent(entry.entryPath)}" id="wikiLink" data-path="${entry.entryPath}">Read &nbsp; <span class="nf-fa-arrow_right"></span></a>
                `;

            } else {
                wikiContainer.innerHTML = `
                <h2>Unknown Location</h2>
                <hr>
                <p>No database entries found for this location. Do not worry, an entry might be on the way.</p>
                `;
            }
        })
        .catch(error => {
            console.error("Error loading entry");
            wikiContainer.innerHTML = `<p>Error loading entry.</p>`
        })
}

// Switch tab
function switchTab(tabId) {
    document.querySelectorAll('.tabContent').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tabBtn').forEach(el => el.classList.remove('active'));

    document.getElementById(tabId).style.display = 'block';

    const activeBtn = Array.from(document.querySelectorAll('.tabBtn'))
        .find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) activeBtn.classList.add('active');

    if (tabId === 'directoryTab') {
        loadDirectory();
    }
}

// Load directory
function loadDirectory() {
    const container = document.getElementById('directoryList')

    fetch('wikiData.json')
        .then(response => response.json())
        .then(data => {
            let html = '';

            for (const [category, entries] of Object.entries(data)) {
                html += `<h4 class="categoryHeader">${capitalizeFirstLetter(category)}</h4><ul> `

                for (const [key, entry] of Object.entries(entries)) {
                    const entryUrl = `entry.html?file=${encodeURIComponent(entry.entryPath)}`;
                    html += `
                    <li class="directoryItem">
                        <a href="#" onclick="event.preventDefault(); displayWikiEntry('${key}')">
                        <strong>${entry.title}</strong>
                        </a>
                        <small>(${entry.type})</small>
                        <a href="${entryUrl}" class="directEntryLink">Read <span class="nf-fa-arrow_right"></span></a>
                    </li>
                    `;
                }
                html += '</ul>';   
            }

            container.innerHTML = html;
        })
        .catch(err => console.error("Error loading directory:", err));
}


// ----------------------------
//  svg fetch and leaflet init
// ----------------------------

var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1.2,
    maxZoom: 8,
    zoomControl: true,
    attributionControl: false
})

var bounds = [[0,0], [1000, 2000]];

// Load map
fetch('assets/images/capricorns_galaxy_map.svg')
    .then(response => response.text())
    .then(svgText => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(svgText, "image/svg+xml");
        var svgElement = doc.documentElement;

        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        var image = L.svgOverlay(svgElement, bounds, {
            interactive: true,
        }).addTo(map);

        image.on('click', function(e) {
            var originalMouseEvent = e.originalEvent;
            var group = originalMouseEvent.target.closest('g[id]');
            if (group) {
                console.log("Clicked on group ID:", group.id)

                if (typeof displayWikiEntry === 'function') {
                    displayWikiEntry(group.id);
                }
            }
        })
    })
    .catch(error => console.error("Error loading galaxy map:", error));

map.fitBounds(bounds)

map.setView([500, 1000], -2);

