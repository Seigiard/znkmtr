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

(function($) {
    'use strict';

    var currentFontData, defaultFontData,
        bypassCalculationForDistance, bypassCalculationForHeight,
        currentDistance, currentHeight, mapInitInterval, map;

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
    var $map = $('.mapus');

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

    mapInitInterval = setInterval(function() {
        if (window.ymaps && window.ymaps.Map) {
            initMap();
            clearInterval(mapInitInterval);
            mapInitInterval = null;
        }
    }, 300);

    $('#show-on-map').click(function() {
        var visible = ($map.css('visibility') == 'visible');
        visible ? $map.css('visibility', 'hidden') : $map.css('visibility', 'visible');
    });

    $distanceInput.on('focus', function() {
        setDistanseSize($($distanceInput).val());
    });
    $symbolsHeight.on('focus', function() {
        setLetterHeight($($symbolsHeight).val());
    });

    $distanceInput.on('change blur keyup', debounce(handlerInputDistance, 100));
    $symbolsHeight.on('change blur keyup', debounce(handlerInputLettersHeight, 100));

    setInputValidation($distanceInput);
    setInputValidation($symbolsHeight);

    function setInputValidation($element) {
        $element.on('keydown', function(e) {
            var value = $element.data('value');

            if (
                // ($.inArray(e.keyCode, [9, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 8, 13, 190, 188]) == -1)
                // tab, digits, digits in num pad, 'back', 'enter', '.', ','
                // ||
                ($.inArray(e.keyCode, [189, 187, 69]) > -1)
                ||
                (e.keyCode == 190 && (''+value).indexOf(',') > -1) // not allow dot and comma '.'
                ||
                (e.keyCode == 190 && (''+value).indexOf('.') > -1) // not allow dot and dot '.'
                ||
                (e.keyCode == 188 && (''+value).indexOf(',') > -1) // not allow comma and dot ','
                ||
                (e.keyCode == 188 && (''+value).indexOf('.') > -1) // not allow comma and comma ','
                ||
                (e.keyCode == 190 && value.length == 0) // not allow dot '.' at the begining
                ||
                (e.keyCode == 188 && value.length == 0) // not allow dot ',' at the begining
            ) {
                e.preventDefault();
            }
        });
    }

    function handlerInputDistance(event) {
        if(!$.isNumeric($distanceInput.val())){
            return;
        }

        var distance = +$distanceInput.val();
        var lettersHeight = distance * currentFontData.ratio;

        setCalculatedLetterHeight(lettersHeight);
        setDistanseSize(distance);
    }

    function handlerInputLettersHeight() {
        if(!$.isNumeric($symbolsHeight.val())){
            return;
        }

        var lettersHeight = +$symbolsHeight.val();
        var distance = lettersHeight / currentFontData.ratio;

        setLetterHeight(lettersHeight);
        setCalculatedDistanseSize(distance);
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
        setSignboardSize(distance);
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

    function setSignboardSize(distance) {
        var range = _getSignboardRange(distance);
        // var fontSize = (distance * basicFontSize / basicDistance[range]).toFixed(3);
        // $signboardSize.css('fontSize', fontSize + 'em');
        $visitor.removeClass('visitor--small visitor--medium visitor--big').addClass('visitor--' + range);
    }

    function initMap() {
        map = new ymaps.Map("mapus-map", {
            center: [46.4845, 30.7418],
            zoom: 17
        });

        map.behaviors.get('ruler').geometry.events.add('change', function(e) {
            console.warn(map.behaviors.get('ruler').geometry.getDistance());
            var distance = map.behaviors.get('ruler').geometry.getDistance();
            $distanceInput.val(distance.toFixed(2));
            if (distance) handlerInputDistance();
        });

    }

})(Zepto);
