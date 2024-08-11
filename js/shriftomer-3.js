(function ($) {
    'use strict';

    var currentFontData, defaultFontData,
        currentDistance, currentHeight;

    var basicFontSize = 2.563;
    var distanceBoundSmallToMedium = 15;
    var distanceBoundMediumToBig = 50;

    var basicDistance = {
        'small': 10,
        'medium': 20,
        'big': 70
    };

    var $signboardSize = $('#signboardSize');
    var $visitor = $('#visitor');
    var $distanceInput = $('#distance-input');
    var $symbolsHeight = $('#symbols-height');
    var $mapWrapper = $('.mapus');

    var fonts = {
        //original Direct type
        DIRECT: {
            k: 4.8780487804878,
            m: 51.7,
            ratio: 2.732
        }
    };

    defaultFontData = fonts.DIRECT;
    currentFontData = defaultFontData;

    initMap()

    $('#show-on-map').on('click', function () {
        $mapWrapper.toggleClass('mapus--visible')
    });

    $distanceInput.on('focus', function () {
        setDistanseSize($($distanceInput).val());
    });
    $symbolsHeight.on('focus', function () {
        setLetterHeight($($symbolsHeight).val());
    });

    $distanceInput.on('change blur keyup', debounce(handlerInputDistance, 100));
    $symbolsHeight.on('change blur keyup', debounce(handlerInputLettersHeight, 100));

    setInputValidation($distanceInput);
    setInputValidation($symbolsHeight);

    function setInputValidation($element) {
        $element.on('keydown', function (e) {
            var value = $element.data('value');

            if (
                // ($.inArray(e.keyCode, [9, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 8, 13, 190, 188]) == -1)
                // tab, digits, digits in num pad, 'back', 'enter', '.', ','
                // ||
                ($.inArray(e.keyCode, [189, 187, 69]) > -1)
                ||
                (e.keyCode == 190 && ('' + value).indexOf(',') > -1) // not allow dot and comma '.'
                ||
                (e.keyCode == 190 && ('' + value).indexOf('.') > -1) // not allow dot and dot '.'
                ||
                (e.keyCode == 188 && ('' + value).indexOf(',') > -1) // not allow comma and dot ','
                ||
                (e.keyCode == 188 && ('' + value).indexOf('.') > -1) // not allow comma and comma ','
                ||
                (e.keyCode == 190 && value.length == 0) // not allow dot '.' at the begining
                ||
                (e.keyCode == 188 && value.length == 0) // not allow dot ',' at the begining
            ) {
                e.preventDefault();
            }
        });
    }

    function handlerInputDistance() {
        if (!$.isNumeric($distanceInput.val())) {
            return;
        }

        var distance = +$distanceInput.val();
        var lettersHeight = getLetterHeight(distance);

        setCalculatedLetterHeight(lettersHeight);
        setDistanseSize(distance);
    }

    function handlerInputLettersHeight() {
        if (!$.isNumeric($symbolsHeight.val())) {
            return;
        }

        var lettersHeight = +$symbolsHeight.val();
        var distance = getDistance(lettersHeight)

        setLetterHeight(lettersHeight);
        setCalculatedDistanseSize(distance);
    }

    function getLetterHeight(distance) {
        return distance * currentFontData.ratio;
    }

    function getDistance(lettersHeight) {
        return lettersHeight / currentFontData.ratio;
    }

    function getFixedString(value) {
        return value.toFixed(2);
    }

    function setCalculatedDistanseSize(distance) {
        if (distance != distance.toFixed(2)) {
            $distanceInput.val(distance.toFixed(2));
        } else {
            $distanceInput.val(distance);
        }

        setDistanseSize(distance);
    }

    function setDistanseSize(distance) {
        if (currentDistance === distance) {
            return;
        }

        currentDistance = distance;
        $distanceInput.data('value', distance);
        setVisitorIcon(distance);
    }

    function setCalculatedLetterHeight(lettersHeight) {
        if (lettersHeight != lettersHeight.toFixed(2)) {
            $symbolsHeight.val(lettersHeight.toFixed(2));
        } else {
            $symbolsHeight.val(lettersHeight);
        }

        setLetterHeight(lettersHeight);
    }

    function setLetterHeight(lettersHeight) {
        if (lettersHeight === currentHeight) {
            return;
        }

        currentHeight = lettersHeight;
        $symbolsHeight.data('value', lettersHeight);
    }

    function _getSignboardRange(distance) {
        if (distance < distanceBoundSmallToMedium) {
            return 'small';
        }

        if (distance > distanceBoundMediumToBig) {
            return 'big';
        }

        return 'medium';
    }

    function setVisitorIcon(distance) {
        var range = _getSignboardRange(distance);
        $visitor.removeClass('scale__homus--small', 'scale__homus--medium', 'scale__homus--big')
        $visitor.addClass('scale__homus--' + range);

        // var fontSize = (distance * basicFontSize / basicDistance[range]).toFixed(3);
        // $signboardSize.css('fontSize', fontSize + 'em');
    }


    function initMap() {
        document.body.classList.add('osmaps')

        // Creating map options
        var mapOptions = {
            center: [46.4845, 30.7418],
            zoom: 17
        }

        // Creating a map object
        var map = new L.map('mapus-osmaps', mapOptions);

        // Creating a Layer object
        var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

        // Adding layer to the map
        map.addLayer(layer);

        L.control.ruler({
            position: 'topleft',
            fnTooltipText: function (distanceInKm) {
                const distance = distanceInKm * 1000;
                const result = []

                result.push('<b>Расстояние:</b>&nbsp;' + getFixedString(distance) + '&nbsp;м')
                result.push('<b>Высота букв:</b>&nbsp;' + getFixedString(getLetterHeight(distance)) + '&nbsp;мм');


                return result.join('<br>');
            },
            onSet: function (distanceInKm) {
                var distance = distanceInKm * 1000;
                var lettersHeight = getLetterHeight(distance);

                setCalculatedLetterHeight(lettersHeight);
                setCalculatedDistanseSize(distance);
            }
        }).addTo(map);
    }
})(Zepto);

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
