(function (factory, window) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('leaflet'));
  }
  if (typeof window !== 'undefined' && window.L) {
    window.L.Ruler = factory(L);
  }
}(function (L) {
  "use strict";
  L.Control.Ruler = L.Control.extend({
    options: {
      position: 'topleft',
      circleMarker: {
        color: 'red',
        radius: 2
      },
      lineStyle: {
        color: 'red',
        dashArray: '1,6'
      },
      fnTooltipText: function (distanceInKm) {
        return '<b>' + this.lengthUnit.label + '</b>&nbsp;' + distanceInKm.toFixed(this.lengthUnit.decimal) + '&nbsp;' + this.lengthUnit.display;
      },
      lengthUnit: {
        display: 'km',
        decimal: 2,
        factor: null,
        label: 'Distance:'
      },
      onSet: function (distanceInKm) { },
      onToggle: function (is_active) { },
    },
    isActive: function () {
      return this._choice;
    },
    onAdd: function (map) {
      this._map = map;
      this._container = L.DomUtil.create('div', 'leaflet-bar');
      this._container.classList.add('leaflet-ruler');
      L.DomEvent.disableClickPropagation(this._container);
      L.DomEvent.on(this._container, 'click', this._toggleMeasure, this);
      this._choice = false;
      this._defaultCursor = this._map._container.style.cursor;
      this._allLayers = L.layerGroup();
      return this._container;
    },
    onRemove: function () {
      L.DomEvent.off(this._container, 'click', this._toggleMeasure, this);
    },
    _toggleMeasure: function () {
      this._choice = !this._choice;
      this.options.onToggle(this._choice);
      this._clickedLatLong = null;
      this._clickedPoints = [];
      if (this._choice) {
        this._map.doubleClickZoom.disable();
        L.DomEvent.on(this._map._container, 'keydown', this._escape, this);
        L.DomEvent.on(this._map._container, 'dblclick', this._closePath, this);
        this._container.classList.add("leaflet-ruler-clicked");
        this._clickCount = 0;
        this._tempLine = L.featureGroup().addTo(this._allLayers);
        this._tempPoint = L.featureGroup().addTo(this._allLayers);
        this._pointLayer = L.featureGroup().addTo(this._allLayers);
        this._polylineLayer = L.featureGroup().addTo(this._allLayers);
        this._allLayers.addTo(this._map);
        this._map._container.style.cursor = 'crosshair';
        this._map.on('click', this._clicked, this);
        this._map.on('mousemove', this._moving, this);
      }
      else {
        this._map.doubleClickZoom.enable();
        L.DomEvent.off(this._map._container, 'keydown', this._escape, this);
        L.DomEvent.off(this._map._container, 'dblclick', this._closePath, this);
        this._container.classList.remove("leaflet-ruler-clicked");
        this._map.removeLayer(this._allLayers);
        this._allLayers = L.layerGroup();
        this._map._container.style.cursor = this._defaultCursor;
        this._map.off('click', this._clicked, this);
        this._map.off('mousemove', this._moving, this);
      }
    },
    _clicked: function (e) {
      this._clickedLatLong = this._clickCount === 0 ? e.latlng : this._findFarestPoint(e.latlng);

      this._clickedPoints.push(this._clickedLatLong);
      L.circleMarker(this._clickedLatLong, this.options.circleMarker).addTo(this._pointLayer);

      if (this._clickCount > 0 && !e.latlng.equals(this._clickedPoints[this._clickedPoints.length - 2])) {
        if (this._movingLatLong) {
          L.polyline([this._clickedPoints[this._clickCount - 1], this._movingLatLong], this.options.lineStyle).addTo(this._polylineLayer);
        }

        const text = this.options.fnTooltipText(this._result.Distance)

        L.circleMarker(this._clickedLatLong, this.options.circleMarker).bindTooltip(text, { permanent: true, className: 'result-tooltip' }).addTo(this._pointLayer).openTooltip();
      }
      this._clickCount++;

      if (this._clickCount > 1) {
        this.options.onSet(this._result.Distance);
        this._closePath();
      }
    },
    _moving: function (e) {
      if (!this._clickedLatLong) {
        return
      }

      L.DomEvent.off(this._container, 'click', this._toggleMeasure, this);
      this._movingLatLong = this._findFarestPoint(e.latlng);

      if (this._tempLine) {
        this._map.removeLayer(this._tempLine);
        this._map.removeLayer(this._tempPoint);
      }
      this._tempLine = L.featureGroup();
      this._tempPoint = L.featureGroup();
      this._tempLine.addTo(this._map);
      this._tempPoint.addTo(this._map);


      this._result = {
        Distance: convertRadiansToKilometers(distanceInRadians(this._clickedLatLong, this._movingLatLong))
      };
      const text = this.options.fnTooltipText(this._result.Distance)

      L.polyline([this._clickedLatLong, this._movingLatLong], this.options.lineStyle).addTo(this._tempLine);
      L.circleMarker(this._movingLatLong, this.options.circleMarker).bindTooltip(text, { sticky: true, offset: L.point(0, -40), className: 'moving-tooltip' }).addTo(this._tempPoint).openTooltip();
    },
    _escape: function (e) {
      if (e.keyCode === 27) {
        if (this._clickCount > 0) {
          this._closePath();
        }
        else {
          this._choice = true;
          this._toggleMeasure();
        }
      }
    },
    _closePath: function () {
      this._map.removeLayer(this._tempLine);
      this._map.removeLayer(this._tempPoint);
      if (this._clickCount <= 1) this._map.removeLayer(this._pointLayer);
      this._choice = false;
      L.DomEvent.on(this._container, 'click', this._toggleMeasure, this);
      this._toggleMeasure();
    },
    _findFarestPoint: function (coord1) {
      return findFarestPoint(this._clickedLatLong, coord1, 0.1);
    }
  });
  L.control.ruler = function (options) {
    return new L.Control.Ruler(options);
  };
}, window));

function findFarestPoint(coord1, coord2, maxDistanceInKm) {
  const maxDistance = maxDistanceInKm / 6371;
  const distance = distanceInRadians(coord1, coord2);

  if (distance > maxDistance) {
    const { lat: lat1, lng: lng1 } = coord1;
    const { lat: lat2, lng: lng2 } = coord2;

    const bearing = Math.atan2(
      Math.sin(toRadians(lng2 - lng1)) * Math.cos(toRadians(lat2)),
      Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
      Math.sin(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.cos(toRadians(lng2 - lng1))
    );

    const lat1Rad = toRadians(lat1);
    const lng1Rad = toRadians(lng1);

    const latnRad = Math.asin(
      Math.sin(lat1Rad) * Math.cos(maxDistance) +
      Math.cos(lat1Rad) * Math.sin(maxDistance) * Math.cos(bearing)
    );
    const lngnRad =
      lng1Rad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(maxDistance) * Math.cos(lat1Rad),
        Math.cos(maxDistance) - Math.sin(lat1Rad) * Math.sin(latnRad)
      );

    const latn = (latnRad * 180) / Math.PI;
    const lngn = (lngnRad * 180) / Math.PI + 360;

    return { lat: latn, lng: lngn % 360 };
  } else {
    return coord2;
  }
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInRadians(coord1, coord2) {
  const { lat: lat1, lng: lng1 } = coord1;
  const { lat: lat2, lng: lng2 } = coord2;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2) *
    Math.cos(lat1Rad) *
    Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c;
}

function convertRadiansToKilometers(value) {
  return value * 6371;
}