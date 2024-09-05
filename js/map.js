const attributeLabels = [
    '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet</a>',
    '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    '<a href="https://carto.com/attributions">CARTO</a>'
].join(' / ');

initMap({
    center: [46.48491831248254, 30.739801915137466],
    zoom: 17, // 20 max
    attributionControl: false
});

function initMap(mapOptions) {
    document.body.classList.add('osmaps')

    // Creating a map object
    var map = new L.map(mapElementId, mapOptions);

    // Creating a Layer object
    // var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    // var layer = new L.TileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png');
    // var layer = new L.TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');
    var layer = new L.TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png');


    // Adding layer to the map
    map.addLayer(layer);

    L.control.attribution({ prefix: attributeLabels }).addTo(map)

    L.control.ruler({
        position: 'topleft',
        fnTooltipText: function (distanceInKm) {
            const distance = roundNumber(distanceInKm * 1000);
            const result = []

            result.push('<b>Відстань:</b>&nbsp;' + distance + '&nbsp;м')
            result.push('<b>Висота букв:</b>&nbsp;' + getLetterHeight(distance) + '&nbsp;мм');


            return result.join('<br>');
        },
        onSet: function (distanceInKm) {
            updateDistance(roundNumber(distanceInKm * 1000));
        }
    }).addTo(map);
}