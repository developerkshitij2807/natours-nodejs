"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.displayMap = void 0;

/* eslint-disable */
var displayMap = function displayMap(locations) {
  mapboxgl.accessToken = 'pk.eyJ1Ijoia3NoaXRpajI4IiwiYSI6ImNrOHVhdDhwdTA0c28zZ3BscmlsbjN2ODcifQ.txZpgBN4OCYIqq1UFl_Kwg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kshitij28/ck8ub5uht16ya1iqojchemdli',
    center: [-118.4085, 33.9416],
    scrollZoom: false
  });
  var bounds = new mapboxgl.LngLatBounds();
  locations.forEach(function (loc) {
    // Create Marker
    var el = document.createElement('div');
    el.className = 'marker'; // Add Marker

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map); // Pop-Up

    new mapboxgl.Popup({
      offset: 30
    }).setLngLat(loc.coordinates).setHTML("<p>Day  ".concat(loc.day, ": ").concat(loc.description, "</p>")).addTo(map); // Extends map bounds to include location

    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};

exports.displayMap = displayMap;