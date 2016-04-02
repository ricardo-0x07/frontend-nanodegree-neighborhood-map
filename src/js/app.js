/* jslint browser:true*/
/* eslint-disable no-unused-vars*/
/* global window, $, google, document, ko*/
/* eslint no-negated-condition: 2*/

/* eslint-disable no-use-before-define*/
var app = app || {};

/**
*
*/
function googleSuccess() {
 // timer for fallback in case requests are taking too long
  app.model.requestTimer = setTimeout(function() {
    app.model.timedOut = true;
    app.model.googleError();
  }, 10000);
  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  // the if statement checks to see if its ok to proceed with the request for the initial data for the map locations
  app.model.init();
}

/**
* @description ViewModel
* @constructor
*/
app.ViewModel = function() {
  var self = this;
  // Stores knockout template binding data for the main view
  app.ViewModel.viewData = [];
  // Stores name of the knockout template to be used for the main view
  app.ViewModel.view = ko.observable('app-template');
  // Yelp error message
  app.ViewModel.yelpErrorMessage = ko.observableArray();
  // Yelp business data retrieved
  app.ViewModel.businesses = ko.observableArray();
  // Name of the selected place for infoWindow
  app.ViewModel.currentPlaceName = ko.observableArray();
  // ko observable array that stores the markers used to create the list view and populate the map
  app.ViewModel.markers = ko.observableArray();

   /**
   * @description Animates selected marker with a bounce animation
   * @constructor
   */
  app.ViewModel.toggleBounce = function() {
    app.ViewModel.markers().forEach(function(mark) {
      mark.setAnimation(null);
    });
    app.model.currentMarker.setAnimation(google.maps.Animation.BOUNCE);
  };
  /* @description add back market to map
  * @param {number} index - position of marker in markers array
  * @param {object} map - map object
  */
  app.ViewModel.addMarker = function(index, map) {
    app.ViewModel.markers()[index].setMap(map);
  };
    /* @description Sets the map on all markers in the array.
    * @param {object} map - map object
    */
  app.ViewModel.setMapOnAll = function(map) {
    for (var i = 0; i < app.ViewModel.markers().length; i++) {
      app.ViewModel.markers()[i].setMap(map);
    }
  };

    /* @description Filters markers array .
    * @param {string} filter - string used to filter markers array
    */
  app.ViewModel.filterMarkers = function(filter) {
    app.ViewModel.setMapOnAll(null);

    app.ViewModel.markers().forEach(function(marker, index) {
      var markerStr = marker.title;
      if (!filter) {
        app.ViewModel.setMapOnAll(app.model.map);
      }

      if (markerStr.toLowerCase().indexOf(filter) !== -1) {
        app.ViewModel.addMarker(index, app.model.map);
      }
    });
  };

  // ko observable that collects the filter from the html input element
  app.ViewModel.koFilter = ko.observable('');
  // app.ViewModel.myData.push(app.ViewModel.koFilter);
  // ko computed observable that will filter the markers observable array based on the filter input
  app.ViewModel.filteredItems = ko.computed(function() {
    var filter = app.ViewModel.koFilter().toLowerCase();

    if (filter) {
      app.ViewModel.filterMarkers(filter);
      return ko.utils.arrayFilter(app.ViewModel.markers(), function(item) {
        return item.title.toLowerCase().indexOf(filter) !== -1;
      });
    }
    app.ViewModel.filterMarkers(filter);
    return app.ViewModel.markers();
  });
  // Set app main view data
  app.ViewModel.viewData
  .push({filteredItems: app.ViewModel.filteredItems, koFilter: app.ViewModel.koFilter, showInfowindow: app.ViewModel.showInfowindow});

   /* @description Request place details for the current marker selected via list.
   * @param {object} marker - marker selected from list view
   */
  app.ViewModel.showInfowindow = function(marker) {
    app.ViewModel.koFilter('');
    google.maps.event.trigger(marker, 'click');
  };
};
