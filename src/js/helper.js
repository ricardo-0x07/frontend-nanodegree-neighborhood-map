/* jslint browser:true*/
/* eslint-disable no-unused-vars*/
/* global window, $, OAuth, google, Handlebars, document, ko*/
/* eslint no-negated-condition: 2*/

/* eslint-disable no-use-before-define*/
var app = app || {};

app.model = {
  // hard coded locations
  locations: [

    "320 Pioneer Way, Mountain View, CA 94041, United States",
    "80 W El Camino Real, Mountain View, CA 94040, United States",
    "Grant Park Plaza, 1040 Grant Road #350, " +
    "Mountain View, CA 94040, United States",
    "635 W Dana St, Mountain View, CA 94041, United States",
    "53 W El Camino Real, Mountain View, CA 94040, United States",
    "Grant Park Plaza, 1040 Grant Rd, Mountain View, CA 94040, United States",
    "145 E Dana St, Mountain View, CA 94041, United States",
    "701 E El Camino Real, Mountain View, CA 94040, United States",
    "Grant Park Plaza, 1350 Grant Rd Suite 8, " +
    "Mountain View, CA 94040, United States",
    "750 Castro St, Mountain View, CA 94041, United States"],
  // div for google map
  googleMap: '<div id="map"></div>',
  // current selected marker
  currentMarker: null,
  // array of markers generated
  markers: [],
  // options for google maps
  mapOptions: {disableDefaultUI: true},
  // var that stores google service
  service: null,
  // Information window that displays place details
  infoWindow: null,
  // Information window that displays yelp data retrieval error
  errorInfoWindow: null,
  // Information window that displays a loading animation
  loadingInfoWindow: null,
  // Google request time out boolean var
  timedOut: false,
  // Google map object
  map: null,
  // Google request time out timer
  requestTimer: null,
  stop: false,
  isInfoWindowLoaded: false,
  isYelpError: false,
  isErrorInfoWindowLoaded: false,
    /**
    * @description get an instance of the information window for each marker that displays request details
    * @constructor
    */
  getInfoWindow: function() {
    var templateBinding =
    '<div id="info-window">' +
      '<h4 data-bind="text: app.ViewModel.currentPlaceName"></h4>' +
      '<h6><strong>The 3 other nearby places via Yelp</strong></h6>' +
      '<table class="table table-striped table-condensed" id="marker-tbl">' +
        '<thead><tr><th> Business </th><th> Rated </th>' +
        '<th class="hidden-xs"> Phone </th></tr> </thead>' +
        '<tbody data-bind="template: { name: \'business-template\', ' +
        'foreach: app.ViewModel.businesses, as: \'business\' }"></tbody>' +
        '</table>' +
    '</div>';
    app.model.isInfoWindowLoaded = false;
    return new google.maps.InfoWindow({
      content: templateBinding
    });
  },
  /**
  * @description get an instance of the information window for each marker that displays request errors
  * @constructor
  */
  getErrorInfoWindow: function() {
    var templateBinding = '<div id="error-info-window" data-bind="template:' +
    '{ name: \'yelp-error-template\', data: app.ViewModel.yelpErrorMessage }">';
    app.model.isErrorInfoWindowLoaded = false;
    return new google.maps.InfoWindow({
      content: templateBinding
    });
  },
  /**
  * @description get an instance of the information window for each marker that displays request loading animation
  * @constructor
  */
  getLoadingInfoWindow: function() {
    var templateBinding =
    '<i class="fa fa-refresh fa-spin" style="font-size:20px"></i>';
    return new google.maps.InfoWindow({
      content: templateBinding
    });
  },
  bounds: null,
  centerMap: function() {
    app.model.map.setCenter(app.model.bounds.getCenter());
  },
  auth: {
      //
      // Update with your auth tokens.
      //
    consumerKey: "CczkBNRj_eaoMgqd0o4n1A",
    consumerSecret: "jfMHfpHubGUZWRBXVAjTaTMRrbo",
    accessToken: "0IKGCVVzoRIpB2WKQtFPYa_stRAlzmYO",
      // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
      // You wouldn't actually want to expose your access token secret like this in a real application.
    accessTokenSecret: "JEoYIbjq2NJkywPo7HBu_pG4GgE",
    serviceProvider: {signatureMethod: "HMAC-SHA1"}
  },
    /*
    * @description Function to search for Yelp data for a specific place
    * @constructor
    * @param {object} marker - current place marker for which Yelp data is to searched for
    */
  getYelpData: function(currentMarker) {
    var terms = 'business';
    var near = currentMarker.formatted_address;
    var limit = 3;

    var accessor = {
      consumerSecret: app.model.auth.consumerSecret,
      tokenSecret: app.model.auth.accessTokenSecret
    };

    var parameters = [];
    parameters.push(['term', terms]);
    parameters.push(['limit', limit]);
    parameters.push(['location', near]);
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', app.model.auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', app.model.auth.consumerSecret]);
    parameters.push(['oauth_token', app.model.auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

    var message = {
      action: 'http://api.yelp.com/v2/search',
      method: 'GET',
      parameters: parameters
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var parameterMap = OAuth.getParameterMap(message.parameters);
    parameterMap.oauth_signature =
    OAuth.percentEncode(parameterMap.oauth_signature);

    // time out yelp api request
    var apiTimeout = setTimeout(function() {
      app.model.handleError('Yelp data retrieval error!');
    }, 5000);

    $.ajax({
      url: message.action,
      data: parameterMap,
      cache: true,
      dataType: 'jsonp',
      jsonpCallback: 'cb'
    }).done(function(data) {
      app.model.closeInfoWindow();
      // Clear api request time out
      clearTimeout(apiTimeout);

      var businesses = data.businesses;
      // Clear data
      app.ViewModel.currentPlaceName([]);
      // Load data
      app.ViewModel.currentPlaceName.push(currentMarker.title);

      var tempMap = app.model.map;

      app.model.infoWindow.open(tempMap, currentMarker);
      // Clear array
      app.ViewModel.businesses([]);
      // Load array
      businesses.forEach(function(business) {
        app.ViewModel.businesses.push(business);
      });

    // This was the approach implemented here a callback is used in the .fail() methods parenthesis
    // jqXHR.fail(function( jqXHR, textStatus, errorThrown ) {});
    // An alternative construct to the error callback option,
    // the .fail() method replaces the deprecated .error() method.
    // Refer to deferred.fail() for implementation details.
    /* eslint-disable no-unused-vars*/
    }).fail(function(jqXHR, textStatus, errorThrown) {
      // Calls error function to setup marker infowindow with error details
      app.model.handleError(textStatus);
    });
  },
  /**
  * @description Handles errors that may result from the Yelp Api request
  * @constructor
  * @param {object} error - details of the error that occured
  */
  handleError: function(error) {
    var tempMap = app.model.map;
    var tempMarker = app.model.currentMarker;
    app.model.closeInfoWindow();
    app.model.errorInfoWindow.open(tempMap, tempMarker);

    var message = 'Error: ' +
    error + ' \n\nPlease Try again.';
    app.ViewModel.yelpErrorMessage([]);
    app.ViewModel.yelpErrorMessage.push(message);
  },
    /** @description fallback function
    * @return {boolean} true when done
    */
  googleError: function() {
    app.ViewModel.view('error-template');
    app.model.stop = true;
    return (true);
  },
  /*
  * @description init() starts the application
  */
  init: function() {
    $('.mapDiv').append(app.model.googleMap);
    /*
      For the map to be displayed, the googleMap var must be
      appended to #mapDiv.
    */
    app.model.map =
    new google.maps.Map(document.getElementById('map'), app.model.mapOptions);
    app.model.service = new google.maps.places.PlacesService(app.model.map);
    // set a single instance of infoWindow to be reused for each marker
    app.model.infoWindow = app.model.getInfoWindow();
    app.model.errorInfoWindow = app.model.getErrorInfoWindow();
    app.model.loadingInfoWindow = app.model.getLoadingInfoWindow();
    // add listener to register bindings with the dom
    google.maps.event.addListener(app.model.infoWindow, 'domready', function() {
      if (!app.model.isInfoWindowLoaded) {
        ko.applyBindings(appViewModel, $("#info-window")[0]);
        app.model.isInfoWindowLoaded = true;
      }
    });
    google.maps.event
    .addListener(app.model.errorInfoWindow, 'domready', function() {
      if (!app.model.isErrorInfoWindowLoaded) {
        ko.applyBindings(appViewModel, $("#error-info-window")[0]);
        app.model.isErrorInfoWindowLoaded = true;
      }
    });
    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();
    // Iterates through the array of locations, creates a search object for each location
    app.model.locations.forEach(function(place) {
      // the search request object
      var request = {query: place};
      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      app.model.service.textSearch(request, app.model.textSerachCallback);
    });
    google.maps.event
    .addListener(app.model.map, 'click', app.model.closeInfoWindow);
      // @description Vanilla JS way to listen for resizing of the window
      // and adjust map bounds
    window.addEventListener('resize', function(e) {
      // Make sure the map bounds get updated on page resize
      app.model.map.fitBounds(window.mapBounds);
    });
  },
  /*
  * @description Closes information windows
  */
  closeInfoWindow: function() {
    app.model.infoWindow.close();
    app.model.errorInfoWindow.close();
    app.model.loadingInfoWindow.close();
  },
  /*
  * @description callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  * @param {object} results - search returned results for a location
  * @param {string} status - places api request status
  */
  textSerachCallback: function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      console.log(results[0]);
      app.model.createMapMarker(results[0]);

      var place = results[0];
    } else {
      /* eslint-disable no-alert*/
      app.model.googleError();
      window.alert('Error retrieving list of places, Try Again');
      return;
    }
  },
  /*
  @description createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  @param {object} placeData - Google Places search result data
  */
  createMapMarker: function(placeData) {
    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.name;   // name of the place from the place service
    app.model.bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: app.model.map,
      position: placeData.geometry.location,
      title: name,
      placeId: placeData.place_id,
      draggable: true,
      animation: google.maps.Animation.DROP,
      formatted_address: placeData.formatted_address
      // icon: placeData.icon
    });

    // add markers to marker array
    app.model.markers.push(marker);
    app.ViewModel.markers.push(marker);

    // Check to see if all initial data was received
    if (app.model.locations.length === app.model.markers.length) {
      app.model.timedOut = false;
      clearTimeout(app.model.requestTimer);
    }

    // add listener to respond to click events on markers
    google.maps.event.addListener(marker, 'click', function() {
      app.model.map.panTo(marker.getPosition());

      // stops bounce animation after 5 seconds
      var timeOut = setTimeout(function() {
        marker.setAnimation(null);
      }, 5000);

      app.model.currentMarker = null;
      app.model.currentMarker = marker;
      var tempMap = app.model.map;
      app.model.closeInfoWindow();
      app.model.loadingInfoWindow.open(tempMap, marker);
      // This requests additional place details by id for the place marker clicked
      app.model.getYelpData(app.model.currentMarker);
    });
    // add listener to trigger bounce animation for marker icon after they have been clicked
    marker.addListener('click', app.ViewModel.toggleBounce);

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    app.model.bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    app.model.map.fitBounds(app.model.bounds);
   // center the map
    // app.model.map.setCenter(app.model.bounds.getCenter());
    app.model.centerMap();
  }

};

var appViewModel = new app.ViewModel();
ko.applyBindings(appViewModel);
