initMap({
    center: [46.4849, 30.7419],
    zoom: 20
});

function initMap(mapOptions) {
    document.body.classList.add('osmaps')

    // Creating a map object
    var map = new L.map(mapElementId, mapOptions);

    // Creating a Layer object
    var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    // Adding layer to the map
    map.addLayer(layer);

    L.control.ruler({
        position: 'topleft',
        fnTooltipText: function (distanceInKm) {
            const distance = roundNumber(distanceInKm * 1000);
            const result = []

            result.push('<b>Расстояние:</b>&nbsp;' + distance + '&nbsp;м')
            result.push('<b>Высота букв:</b>&nbsp;' + getLetterHeight(distance) + '&nbsp;мм');


            return result.join('<br>');
        },
        onSet: function (distanceInKm) {
            updateDistance(roundNumber(distanceInKm * 1000));
        }
    }).addTo(map);
}