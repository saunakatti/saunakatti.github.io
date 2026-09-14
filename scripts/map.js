// ======================
// WORLDBUILDING SCRIPTS
// ======================

// ------------------
// Wiki functions
// ------------------

// Display wiki entry in wikiPanel
function displayWikiEntry(id) {
    switchTab('mapTab');

    const wikiContainer = document.getElementById('wikiText');

    // Reset animation
    wikiContainer.style.animation = 'none';
    wikiContainer.offsetHeight; // Trigger browser reflow
    wikiContainer.style.animation = 'fadeIn 0.25s ease-in-out';

    fetch('../data/wikiData.json')
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
                // format aliases
                let formattedAliases = 'None';
                if (entry.aliases) {
                    formattedAliases = Array.isArray(entry.aliases)
                        ? entry.aliases.join(', ')
                        : entry.aliases;
                }

                // render attributes if present
                let attributesHtml = ''
                if (entry.attributes) {
                    attributesHtml = `
                    <hr>
                    <div class="attributeBox">
                        <strong>Attributes:</strong>
                        <div class="attributeGrid">
                    `;

                    for (const [key, value] of Object.entries(entry.attributes)) {
                        attributesHtml += `
                        <div class="attributeBlock">
                            <span class="attrKey">${key}:</span>
                            <span class="attrVal" data-val="${value}">${value}</span>
                        </div>
                        `;
                    }
                    attributesHtml += `
                        </div>
                    </div>
                    `;
                }

                wikiContainer.innerHTML = `
                <h2><span class="nf-fae-planet"></span> &nbsp; ${entry.title}</h2>
                <hr>

                <div class="entryMeta">
                    <div class="metaRow">
                        <span class="metaLabel">Type:</span>
                        <span class="metaValue">${entry.type}</span>
                    </div>
                    <div class="metaRow">
                        <span class="metaLabel">Aliases:</span>
                        <span class="metaValue">${formattedAliases}</span>
                    </div>
                </div>
                
                ${attributesHtml}
                <hr>
                <div class="description-content">
                    <p>${entry.description || ''}</p>
                </div>
                <hr>
                <a href="entry.html?file=${encodeURIComponent(entry.entryPath)}" id="wikiLink" data-path="${entry.entryPath}">
                    Read &nbsp; <span class="nf-fa-arrow_right"></span>
                </a>
                `;

            } else {
                wikiContainer.innerHTML = `
                <h2><span class="nf-oct-question"></span>&nbsp; Unknown Location</h2>
                <hr>
                <p>No database entry found for ID: &nbsp; <code style="font-size: 1rem;">${id}</code></p>
                <p>Do not worry, an entry might be on the way.</p>
                `;
            }
        })
        .catch(error => {
            console.error("Error loading entry");
            wikiContainer.innerHTML = `<p>Error loading entry.</p>`
        })
}

// Load directory
function loadDirectory() {
    const container = document.getElementById('directoryList');
    if (!container) return;

    fetch('../data/wikiData.json')
        .then(response => response.json())
        .then(data => {
            let html = '';

            for (const [category, entries] of Object.entries(data)) {
                html += `<h4 class="categoryHeader">${capitalizeFirstLetter(category)}</h4><ul> `

                for (const [key, entry] of Object.entries(entries)) {
                    const entryUrl = `entry.html?file=${encodeURIComponent(entry.entryPath)}`;

                    // format attributes into search string
                    let attributeString = '';
                    if (entry.attributes) {
                        attributeString = Object.entries(entry.attributes)
                            .map(([k, v]) => `${k} ${v}`)
                            .join(' ');
                    }

                    // combine all text into a single search target
                    const searchableText = `${entry.title} ${entry.aliases || ''} ${entry.type} ${attributeString} ${entry.description || ''}`.toLowerCase();

                    html += `
                    <li class="directoryItem" data-search="${searchableText}">
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

// Load map and detect input on svg objects
fetch('../worldbuilding/assets/capricorns_galaxy_map.svg')
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

