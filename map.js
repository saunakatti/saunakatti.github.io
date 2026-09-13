var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1.2,
    maxZoom: 8,
    zoomControl: true,
    attributionControl: false
})

var bounds = [[0,0], [1000, 2000]];

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

    function displayWikiEntry(id) {
        const wikiContainer = document.getElementById('wikiText')

        fetch('wikiData.json')
            .then (response => {
                if (!response.ok) throw new Error("Failed fetching database");
                return response.json();
            })
            .then(data => {
                const entry = data[id];
                if (entry) {

                    const descriptionHtml = Array.isArray(entry.description)
                    ? entry.description.map(paragraph => `<p>${paragraph}</p>`).join('')
                    : `<p>${entry.description}</p>`;

                    wikiContainer.innerHTML = `
                    <h2>${entry.title}</h2>
                    <hr>
                    <p><strong>Aliases:</strong> ${entry.aliases}</p>
                    <p><strong>Type:</strong> ${entry.type}</p>
                    <p><strong>Location:</strong> ${entry.location}</p>
                    <p><strong>Danger Level:</strong> ${entry.dangerLevel}</p>
                    <hr>
                    <div class="description-content">
                        ${descriptionHtml}
                    </div>
                    <hr>
                    <a href="entry.html?file=${encodeURIComponent(entry.entryPath)}" id="wikiLink" data-path="${entry.entryPath}">Open Full Entry &nbsp; <span class="nf-fa-arrow_right"></span></a>
                    `;

                } else {
                    wikiContainer.innerHTML = `
                    <h2>Unknown Location</h2>
                    <p>No database entries found for this location.</p>
                    `;
                }
            })
            .catch(error => {
                console.error("Error loading entry");
                wikiContainer.innerHTML = `<p>Error loading entry.</p>`
            })
    }

map.fitBounds(bounds)

map.setView([500, 1000], -2);

