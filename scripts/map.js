// ======================
// WORLDBUILDING SCRIPTS
// ======================

// ------------------
// Wiki functions
// ------------------

// fetch wiki data
let wikiDataPromise = null;
function getWikiData() {
    if (!wikiDataPromise) {
        wikiDataPromise = fetch('./data/wikiData.json').then((response) => {
            if (!response.ok) throw new Error("Failed fetching database");
            return response.json();
        });
    }
    return wikiDataPromise;
}

const wikiContainer = document.getElementById('wikiText');

wikiContainer.addEventListener('click', (e) => {
    const focus = e.target.closest('.focus-link');
    if (focus) {
        e.preventDefault();
        focusOnElement(galaxyOverlay, '#' + focus.dataset.target);
        return;
    }

    const wiki = e.target.closest('.wiki-link');
    if (wiki) {
        e.preventDefault();
        displayWikiEntry(wiki.dataset.target);
    }

    const back = e.target.closest('.wiki-back');
    if (back && entryHistory.length) {
        e.preventDefault();
        displayWikiEntry(entryHistory.pop(), false);
    }
});

function formatWikiLinks(text, validIds) {
    return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => {
        const cls = validIds.has(id) ? 'wiki-link' : 'wiki-link wiki-missing';
        return `<a href="#" class="${cls}" data-target="${id}">${label || id}</a>`;
    });
}

let currentEntryId = null;
let entryHistory = [];

// Display wiki entry in wikiPanel
function displayWikiEntry(id, pushHistory = true) {

    if (pushHistory && currentEntryId) entryHistory.push(currentEntryId);
    currentEntryId = id;

    switchTab('mapTab');

    // Reset animation
    wikiContainer.style.animation = 'none';
    wikiContainer.offsetHeight; // Trigger browser reflow
    wikiContainer.style.animation = 'fadeIn 0.25s ease-in-out';

    getWikiData()
        .then(data => {
            let entry = null;                               // Search all category blocks
            for (const category in data) {
                if (data[category] && data[category][id]) {
                    entry = data[category][id];
                    break;
                }
            }

            const validIds = new Set();
            for (const category in data) {
                if (data[category]) {
                for (const key in data[category]) validIds.add(key);
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

                let focusLink = ''
                if (entry.onMap === true) {
                    focusLink = `
                    <a href="#" class="focus-link" data-target="${id}">
                    View on map &nbsp; <span class="nf-fa-location_crosshairs"></span>
                    </a>
                    <br>
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
                    <p>${formatWikiLinks(entry.description || '', validIds)}</p>
                </div>
                <hr>
                ${focusLink}
                <a href="entry.html?file=${encodeURIComponent(entry.entryPath)}" id="entry-link" data-path="${entry.entryPath}">
                    Read &nbsp; <span class="nf-fa-arrow_right"></span>
                </a>
                <br>
                <a href="#" class="wiki-back">
                    Back &nbsp; <span class="nf-fa-arrow_left">
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
            console.error("Error loading entry", error);
            wikiContainer.innerHTML = `<p>Error loading entry.</p>`
        })
}

// Load worldbuilding directory
function loadDirectory() {
  const container = document.getElementById('directoryList');
  if (!container) return;

  getWikiData()
    .then(data => {
      let html = '';

      for (const [category, entries] of Object.entries(data)) {
        // Wrap each category in a <details> element
        html += `
          <details class="sidebar-category">
            <summary class="categoryHeader">
                <span class="icon closed-icon"></span>
                <span class="icon open-icon"></span>
                <span class="title">${capitalizeFirstLetter(category)}</span>
            </summary>
            <ul>`;

        for (const [key, entry] of Object.entries(entries)) {
          const entryUrl = `entry.html?file=${encodeURIComponent(entry.entryPath)}`;

          // format attributes into search string
          let attributeString = '';
          if (entry.attributes) {
            attributeString = Object.entries(entry.attributes)
              .map(([k, v]) => ` ${k}: ${v}`)
              .join(' ');
          }

          // combine all text into a single search target
          const searchableText = `${entry.title} ${entry.aliases || ''} ${entry.type} ${attributeString} ${entry.description || ''}`.toLowerCase();

          html +=
          `<li class="directoryItem" data-search="${searchableText}">
            <a href="#" onclick="event.preventDefault(); displayWikiEntry('${key}')">
              <strong>${entry.title}</strong>
            </a>
            <small>${entry.type}</small>
            <a href="${entryUrl}" class="directEntryLink">Read <span class="nf-fa-arrow_right"></span></a>
          </li>`;
        }

        html += `
            </ul>
          </details>`;
      }

      container.innerHTML = html;
    })
    .catch(err => console.error('Error loading directory:', err));
}

// Function for toggling map elements
function mapActivate(element) {
    const mapElement = document.querySelector(element);
    const activeBtn = Array.from(document.querySelectorAll('.map-setting'))
    .find(btn => btn.getAttribute('onclick')?.includes(element))

    if (mapElement.style.display === 'none') {
        mapElement.style.display = 'block'
        activeBtn.classList.add('active')
    } else {
        mapElement.style.display = 'none'
        activeBtn.classList.remove('active')
    }
}

// Focus on object on map
function focusOnElement(overlay, element) {
    const mapElement = overlay.getElement().querySelector(element);
    const bbox = mapElement.getBBox();
    const viewBox = overlay.getElement().viewBox.baseVal;

    const fraction = (v, axis) =>
        axis === 'x' ? v / viewBox.width : v / viewBox.height;

    const bounds = overlay.getBounds();

    const west  = bounds.getWest()  + fraction(bbox.x, 'x') * (bounds.getEast() - bounds.getWest());
    const east  = bounds.getWest()  + fraction(bbox.x + bbox.width, 'x') * (bounds.getEast() - bounds.getWest());
    const north = bounds.getSouth() + (1 - fraction(bbox.y, 'y')) * (bounds.getNorth() - bounds.getSouth());
    const south = bounds.getSouth() + (1 - fraction(bbox.y + bbox.height, 'y')) * (bounds.getNorth() - bounds.getSouth());

    map.flyToBounds(L.latLngBounds([[south, west], [north, east]]).pad(0.25));
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

var galaxyOverlay;

// Load map and detect input on svg objects
fetch('../worldbuilding/assets/capricorns_galaxy_map.svg')
    .then(response => response.text())
    .then(svgText => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(svgText, "image/svg+xml");
        var svgElement = doc.documentElement;

        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        galaxyOverlay = L.svgOverlay(svgElement, bounds, {
            interactive: true,
        }).addTo(map);

        galaxyOverlay.on('click', function(e) {
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

