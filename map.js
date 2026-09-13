var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1.2,
    maxZoom: 10,
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
            }
        })
    })
    .catch(error => console.error("Error loading galaxy map:", error));

map.fitBounds(bounds)

map.setView([500, 1000], -2);

