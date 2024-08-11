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

const store = createStore({
    manualInputDistanceInM: false,
    distanceInM: 0,
    manualInputSymbolsHeightInMm: false,
    symbolsHeightInMm: 0,
});

const mapElementId = 'mapus-osmaps';

const $distanceInput = document.getElementById('distance-input');
const $symbolsHeight = document.getElementById('symbols-height');
const $visitorIcon = document.getElementById('visitor');
const $showOnMap = document.getElementById('show-on-map');
const $mapWrapper = document.getElementsByClassName('mapus')[0];


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

updateDistance(10);


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
        const keyCode = e.keyCode;

        // 48-57 - digits
        // 96-105 - digits in num pad
        // 190 - dot

        const functionalKeyCodes = [
            8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46,
            112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145
        ];

        const isFunctionalKey = functionalKeyCodes.includes(e.keyCode) || e.ctrlKey || e.altKey || e.metaKey || e.isComposing;
        const isDigitKeyCode = (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105);
        const isDot = keyCode === 190;

        if (!isFunctionalKey && !isDigitKeyCode && !isDot) {
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
