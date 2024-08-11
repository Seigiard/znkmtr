const createStore = window.unistore

const settings = {
    fonts: {
        //original Direct type
        DIRECT: {
            k: 4.8780487804878,
            m: 51.7,
            ratio: 2.732
        }
    },
    activeFont: 'DIRECT',
    signboardRange: {
        smallToMedium: 15,
        mediumToBig: 50
    },
};

const mapElementId = 'mapus-osmaps';

const $distanceInput = document.getElementById('distance-input');
const $symbolsHeight = document.getElementById('symbols-height');
const $visitorIcon = document.getElementById('visitor');
const $showOnMap = document.getElementById('show-on-map');
const $mapWrapper = document.getElementsByClassName('mapus')[0];

const store = createStore({
    manualInputDistanceInM: false,
    distanceInM: 0,
    manualInputSymbolsHeightInMm: false,
    symbolsHeightInMm: 0,
});


const updateDistance = store.action((_, distanceInM) => {
    return {
        distanceInM,
        symbolsHeightInMm: getLetterHeight(distanceInM)
    }
});

const updateSymbolsHeight = store.action((_, symbolsHeightInMm) => {
    return {
        symbolsHeightInMm,
        distanceInM: getDistance(symbolsHeightInMm)
    }
});

const updateManualInputDistance = store.action((_, mode) => ({ manualInputDistanceInM: mode }));

const updateManualInputSymbolsHeight = store.action((_, mode) => ({
    manualInputSymbolsHeightInMm: mode
}));

const uiStore = createStore({
    visitorIcon: 'small'
});

store.subscribe(({ manualInputDistanceInM, distanceInM, manualInputSymbolsHeightInMm, symbolsHeightInMm }) => {
    if (!manualInputDistanceInM) {
        $distanceInput.value = distanceInM;
    }

    if (!manualInputSymbolsHeightInMm) {
        $symbolsHeight.value = symbolsHeightInMm;
    }

    const range = getSignboardRange(distanceInM);
    uiStore.setState({ visitorIcon: range });
});

uiStore.subscribe(({ visitorIcon }) => {
    $visitorIcon.dataset.range = visitorIcon;
});

$showOnMap.addEventListener('click', function () {
    $mapWrapper.classList.toggle('mapus--visible')
});

setupInput($distanceInput, updateDistance, updateManualInputDistance);
setupInput($symbolsHeight, updateSymbolsHeight, updateManualInputSymbolsHeight);

initMap();

function getLetterHeight(distance) {
    return roundNumber(distance * settings.fonts[settings.activeFont].ratio);
}

function getDistance(letterHeight) {
    return roundNumber(letterHeight / settings.fonts[settings.activeFont].ratio);
}

function getSignboardRange(distance) {
    const { smallToMedium, mediumToBig } = settings.signboardRange;

    if (distance < smallToMedium) {
        return 'small';
    }

    if (distance > mediumToBig) {
        return 'big';
    }

    return 'medium';
}

function initMap() {
    document.body.classList.add('osmaps')

    // Creating map options
    var mapOptions = {
        center: [46.4845, 30.7418],
        zoom: 17
    }

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

function roundNumber(num, scale = 2) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = "";
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

function setupInput($element, updateValue, updateManualInput) {
    $element.addEventListener('focus', function () {
        updateManualInput(true);
    });
    $element.addEventListener('blur', function () {
        updateManualInput(false);
    });
    $element.addEventListener('input', function (e) {
        const debouncedUpdateValue = debounce(updateValue, 150);
        debouncedUpdateValue(+this.value);
    });
    $element.addEventListener('keydown', function (e) {
        var value = e.target.value;

        if (e.ctrlKey || e.altKey || e.metaKey || e.isComposing || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
            return;
        }

        // 48-57 - digits
        // 96-105 - digits in num pad
        // 190 - dot

        const isDigitKeyCode = (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
        const isDot = e.keyCode === 190;

        if (!isDigitKeyCode && !isDot) {
            e.preventDefault();
        } else {
            if (
                (e.keyCode == 190 && ('' + value).indexOf('.') > -1) // not allow dot and dot '.'
                ||
                (e.keyCode == 190 && value.length == 0) // not allow dot '.' at the begining
            ) {
                e.preventDefault();
            }
        }
    });
}

function debounce(func, threshold, execAsap) {
    var timeout;

    return function debounced() {
        var obj = this,
            args = arguments;

        function delayed() {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null;
        };

        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);

        timeout = setTimeout(delayed, threshold || 100);
    };
}
