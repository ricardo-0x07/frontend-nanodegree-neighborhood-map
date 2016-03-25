var app = app || {};

app.model = {

    locations: [

    "320 Pioneer Way, Mountain View, CA 94041, United States",
    "80 W El Camino Real, Mountain View, CA 94040, United States",
    "Grant Park Plaza, 1040 Grant Road #350, Mountain View, CA 94040, United States",
    "635 W Dana St, Mountain View, CA 94041, United States",
    "53 W El Camino Real, Mountain View, CA 94040, United States",
    "Grant Park Plaza, 1040 Grant Rd, Mountain View, CA 94040, United States",
    "145 E Dana St, Mountain View, CA 94041, United States",
    "701 E El Camino Real, Mountain View, CA 94040, United States",
    "Grant Park Plaza, 1350 Grant Rd Suite 8, Mountain View, CA 94040, United States",
    "750 Castro St, Mountain View, CA 94041, United States"
       
    ],
    googleMap:'<div id="map"></div>',
    currentMarker: null,
    mapOptions:{ disableDefaultUI: true },
    service:null,
    // infoWindow: null,
    /**
    * @description get an instance of the information window for each marker
    * @constructor
    */
    getInfoWindow: function(){
        return new google.maps.InfoWindow();
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
      serviceProvider: {
        signatureMethod: "HMAC-SHA1"
      }
    },
    /**
    * @description This is used to search for a specifc place by id, called when the place marker is clicked. 
    * @constructor
    * @param {object} Marker selected by click 
    */
    placeDetailsByPlaceId: function(marker) {
      // Create and send the request to obtain details for a specific place,
      // using its Place ID.
        var place_Id = marker.place_id;

        var request = {placeId: place_Id};

        app.ViewModel.service.getDetails(request, app.model.placeCallBack);

    },
    /**
    * @description Callback for the service details search by id 
    * @constructor
    * @param {object} place - place returned by found by place details search by id 
    * @param {string} status - status code returned by place details search by id 
    */
    placeCallBack: function(place, status) {

        if (status == google.maps.places.PlacesServiceStatus.OK) {

          console.log('place: ');
          console.log(place);
          app.model.getYelpData(place);


        }else{
            window.alert('Error, Try Again');
        }
      },

    /**
    * @description Function to search for Yelp data for a specific place 
    * @constructor
    * @param {object} place - place for which Yelp data is to searched for 
    */
    getYelpData: function(place){

        console.log('about to request yelp data');
        var terms = 'business';
        var near = place.formatted_address;
        var limit = 3;

        var accessor = {
          consumerSecret: app.model.auth.consumerSecret,
          tokenSecret: app.model.auth.accessTokenSecret
        };

        parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['limit', limit]);
        parameters.push(['location', near]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', app.model.auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', app.model.auth.consumerSecret]);
        parameters.push(['oauth_token', app.model.auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        var message = {
          'action': 'http://api.yelp.com/v2/search',
          'method': 'GET',
          'parameters': parameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

        $.ajax({
          'url': message.action,
          'data': parameterMap,
          'cache': true,
          'dataType': 'jsonp',
          'jsonpCallback': 'cb',
        }).done(function(data, textStats, XMLHttpRequest) {
            console.log(data);

                var source = $("#marker-tbl-row").html();
                var template = Handlebars.compile(source);
                var businesses = data.businesses;
                businesses.name = place.name;
                var html    = template(businesses);



                if (app.model.currentMarker.infoWindow !== null) {
                    var tMap = app.ViewModel.map;
                    var tCurrentMarker = app.model.currentMarker;

                    app.model.currentMarker.infoWindow.setContent(html);
                    console.log(app.model.currentMarker.infoWindow);
                    app.model.currentMarker.infoWindow.open(tMap, tCurrentMarker);

                }else{
                    console.log('infowindow is null');

                }


          }).fail(app.model.handleError);



    },
    /**
    * @description Handles errors that may result from the Yelp Api request 
    * @constructor
    * @param {object} error - details of the error that occured 
    */
    handleError:function(error){
        window.alert('Error: '+error.toString()+'has occurred. Please Try again');
        console.log(error.message);

    }

};

/**
* @description ViewModel 
* @constructor
*/
app.ViewModel = function(){

    var self = this;
    
    // timer status variable
    self.timedOut = false;

    // fallback function
    function googleError(){
      var alertmsg = "There has been an error.";
      alertmsg += "\n\nRefresh page and this error should go away.";
      var errorPgContent = '<div id="carousel-example-generic" class="carousel slide"data-ride="carousel"><div class="carousel-inner" role="listbox"><div class="item active"><img  src="images/google-map-api.png" class="img-responsive " alt="Responsive image" /><div class="carousel-caption set-caption"><div class="full-width text-center"><h3 class="error">'+alertmsg.toUpperCase()+'</h3></div></div></div></div>';

      $('#view').html(errorPgContent);
      return (true);
    }

    // ko observable array that stores the markers used to create the list view and populate the map
      self.markers = ko.observableArray([]);
      $("#mapDiv").append(app.model.googleMap);
     
      //try catch statement used to initiate fall back if required 
      try{
        /*
          For the map to be displayed, the googleMap var must be
          appended to #mapDiv.
        */
        app.ViewModel.map = new google.maps.Map(document.getElementById('map'), app.model.mapOptions);

      }catch(e){
        console.log('error: '+e.message);

        // this initiates fallback and stops the initial request for starting
        self.stop = googleError();

      }finally{

      }

      // creates a Google place search service object. PlacesService does the work of
      // actually searching for location data.
      app.ViewModel.service = new google.maps.places.PlacesService(app.ViewModel.map);

    /*
    @description createMapMarker(placeData) reads Google Places search results to create map pins.
    placeData is the object returned from search results containing information
    about a single location.
    @param {object} placeData - Google Places search result data 
    */
    app.ViewModel.createMapMarker = function(placeData) {

      // The next lines save location data from the search result object to local variables
      var lat = placeData.geometry.location.lat();  // latitude from the place service
      var lon = placeData.geometry.location.lng();  // longitude from the place service
      var name = placeData.name;   // name of the place from the place service
      var bounds = window.mapBounds;            // current boundaries of the map window

      // marker is an object with additional data about the pin for a single location
      var marker = new google.maps.Marker({
        map: app.ViewModel.map,
        position: placeData.geometry.location,
        title: name,
        place_id: placeData.place_id,
        draggable: true,
        animation: google.maps.Animation.DROP

      });
    
    // set an infoWindow for each marker
      marker.infoWindow = app.model.getInfoWindow();
      // add markers to marker array
      self.markers.push(marker);

      // Check to see if all initial data was received
      if (app.model.locations.length === self.markers().length) {
        timedOut = false;
        clearTimeout(self.requestTimer);
        console.log('timer reset');

      }


        // add listener to respond to click events on markers
      google.maps.event.addListener(marker, 'click', function() {
        if (app.model.currentMarker !== null && app.model.currentMarker.infoWindow !== null) {
            app.model.currentMarker.infoWindow.close();                
        }

          app.model.currentMarker = null;
          app.model.currentMarker = marker;
          app.model.placeDetailsByPlaceId(app.model.currentMarker);
      });
    
    // add listener to trigger bounce animation for marker icon after they have been clicked
      marker.addListener('click', app.ViewModel.toggleBounce);

      // this is where the pin actually gets added to the map.
      // bounds.extend() takes in a map location object
      bounds.extend(new google.maps.LatLng(lat, lon));
      // fit the map to the new marker
      app.ViewModel.map.fitBounds(bounds);
      // center the map
      app.ViewModel.map.setCenter(bounds.getCenter());
    };


     /**
     * @description Animates selected marker with a bounce animation 
     * @constructor
     */
   app.ViewModel.toggleBounce =function () {
      self.markers().forEach(function(mark){
          mark.setAnimation(null);
      });

        app.model.currentMarker.setAnimation(google.maps.Animation.BOUNCE);
    };

    /*
    * @description callback(results, status) makes sure the search returned results for a location.
    If so, it creates a new map marker for that location.
    * @param {object} results - search returned results for a location
    * @param {string} status - places api request status
    */
    self.callback = function (results, status) {
                  console.log('in callback');

      if (status == google.maps.places.PlacesServiceStatus.OK) {
        app.ViewModel.createMapMarker(results[0]);

          var place = results[0];
          console.log(place);
          
      } else{
        window.alert('Error, Try Again');
        return;
      }

    };

    /*
    * @description pinPoster(locations) takes in the array of locations created by locationFinder()
    and fires off Google place searches for each location
    */
    this.pinPoster =function() {
      

        // Iterates through the array of locations, creates a search object for each location
        app.model.locations.forEach(function(place){

        // the search request object
        var request = { query: place };

        // Actually searches the Google Maps API for location data and runs the callback
          // function with the search results after each search.
          app.ViewModel.service.textSearch(request, self.callback);

      });
    };

    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();

    // pinPoster(locations) creates pins on the map for each location in
    // the locations array
    // the if statement checks to see if its ok to proceed with the request for the initial data for the map locations
    if (!self.stop) {
        self.pinPoster();
    }
    
    // timer for fallback in case requests are taking too long
    self.requestTimer = setTimeout(function() {
        timedOut = true;
        console.log('Request timed out.');
        googleError();
    }, 10000);

    /* @description add back market to map
    * @param {number} index - position of marker in markers array
    * @param {object} map - map object
    */          
    self.addMarker = function (index,map){
          self.markers()[index].setMap(map);
      };

      /* @description Sets the map on all markers in the array.
      * @param {object} map - map object
      */          
    self.setMapOnAll = function(map) {
        for (var i = 0; i < self.markers().length; i++) {
          self.markers()[i].setMap(map);
        }
    };

      /* @description Filters markers array .
      * @param {string} filter - string used to filter markers array
      */          
    self.filterMarkers = function(filter){
        self.setMapOnAll(null);

        self.markers().forEach(function(marker,index){
            var markerStr = marker.title;
            if (!filter) {
                self.setMapOnAll(app.ViewModel.map); 
            }

            if (markerStr.toLowerCase().indexOf(filter) !== -1) {
                self.addMarker(index,app.ViewModel.map);
            }

        });
    };

    // ko observable that collects the filter from the html input element
    self.filter = ko.observable("");
    self.initialize = true;

    // ko computed observable that will filter the markers observable array based on the filter input
    self.filteredItems = ko.computed(function (){
        var filter = self.filter().toLowerCase();

        if (!filter) {
            self.filterMarkers(filter);
            return self.markers();
        } else {
            self.filterMarkers(filter);
            return ko.utils.arrayFilter(self.markers(), function (item) {
                return item.title.toLowerCase().indexOf(filter) !== -1;
            });
        }

    });

     /* @description Request place details for the current marker selected via list.
     * @param {object} marker - marker selected from list view
     */          
    this.showInfowindow = function(marker){
        if (app.model.currentMarker !== null && app.model.currentMarker.infoWindow !== null) {
            app.model.currentMarker.infoWindow.close();                
        }
         self.filter('');

        app.model.currentMarker = null;
        app.model.currentMarker = marker;
        app.ViewModel.toggleBounce();
        app.model.placeDetailsByPlaceId(app.model.currentMarker);
    };



      // @description Vanilla JS way to listen for resizing of the window
      // and adjust map bounds
    window.addEventListener('resize', function(e) {
        //Make sure the map bounds get updated on page resize
       app.ViewModel.map.fitBounds(window.mapBounds);
       // app.ViewModel.map.panTo(place.geometry.location);
       console.log('resized');
    });





};
ko.applyBindings(new app.ViewModel());


