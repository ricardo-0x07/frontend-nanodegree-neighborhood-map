var app = app || {};

app.model = {

        locations: [

        {"formatted_address": "320 Pioneer Way, Mountain View, CA 94041, United States"},
        {"formatted_address": "80 W El Camino Real, Mountain View, CA 94040, United States"},
        {"formatted_address": "Grant Park Plaza, 1040 Grant Road #350, Mountain View, CA 94040, United States"},
        {"formatted_address": "635 W Dana St, Mountain View, CA 94041, United States"},
        {"formatted_address": "53 W El Camino Real, Mountain View, CA 94040, United States"},
        {"formatted_address": "Grant Park Plaza, 1040 Grant Rd, Mountain View, CA 94040, United States"},
        {"formatted_address": "145 E Dana St, Mountain View, CA 94041, United States"},
        {"formatted_address": "701 E El Camino Real, Mountain View, CA 94040, United States"},
        {"formatted_address": "Grant Park Plaza, 1350 Grant Rd Suite 8, Mountain View, CA 94040, United States"},
        {"formatted_address": "750 Castro St, Mountain View, CA 94041, United States"},
           
    ],
    googleMap:'<div id="map"></div>',
    currentMarker: null,
    mapOptions:{ disableDefaultUI: true },
    service:null,
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

            var terms = 'business';
            var near = place.formatted_address;

            var accessor = {
              consumerSecret: app.model.auth.consumerSecret,
              tokenSecret: app.model.auth.accessTokenSecret
            };

            parameters = [];
            parameters.push(['term', terms]);
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
              'success': function(data, textStats, XMLHttpRequest) {

                content = '<div><h3>' + place.name + '</h3>' +
                    "<h5><strong>The 3 other nearby places via Yelp</strong></h5>"+
                    '<table class="table table-striped"><tr><th> Business </th><th> Rated </th><th> Phone </th></tr>'+
                    '<tr><td> '+data.businesses[0].name+' </td><td> '+data.businesses[0].rating+' </td><td> '+data.businesses[0].display_phone+' </td></tr>'+
                    '<tr><td> '+data.businesses[1].name+' </td><td> '+data.businesses[1].rating+' </td><td> '+data.businesses[1].display_phone+' </td></tr>'+
                    '<tr><td> '+data.businesses[2].name+' </td><td> '+data.businesses[2].rating+' </td><td> '+data.businesses[2].display_phone+' </td></tr></table>'+
                    // '<tr><td>Business: '+data.businesses[0].name+'</td><td>   Rated:   '+data.businesses[0].rating+'</td><td>  Phone:    '+data.businesses[0].display_phone+'</td><\tr>'+
                    // '<tr><td>Business: '+data.businesses[1].name+'</td><td>   Rated:   '+data.businesses[1].rating+'</td><td>  Phone:    '+data.businesses[1].display_phone+'</td><\tr>'+
                    // '<tr><td>Business: '+data.businesses[2].name+'</td><td>   Rated:   '+data.businesses[2].rating+'</td><td>  Phone:    '+data.businesses[2].display_phone+'</td><\tr>'+
                    '</div>';

                    this.infoWindow = app.model.getInfoWindow();
                    this.infoWindow.setContent(content);
                    this.infoWindow.open(app.ViewModel.map, app.model.currentMarker);
                    app.model.currentMarker = null;


              },
              error: this.handleError

            });



    },
    /**
    * @description Handles errors that may result from the Yelp Api request 
    * @constructor
    * @param {object} error - details of the error that occured 
    */
    handleError:function(error){
        window.alert('Error: '+error.toString());
        console.log(error.message);

    }






    
        

};

/**
* @description ViewModel 
* @constructor
*/
app.ViewModel = function(){

    var self = this;

    if (typeof google === 'undefined' || google === null) {

      //This will Throw the error if 'google' is not defined
          window.alert('Reload Page, Quota Exceeded');

    } else {
          // var infoWindow = new google.maps.InfoWindow();
          // this.infoWindow = infoWindow;
          self.markers = ko.observableArray([]);
          $("#mapDiv").append(app.model.googleMap);
         
          /*
            For the map to be displayed, the googleMap var must be
            appended to #mapDiv.
          */
          self.map = new google.maps.Map(document.getElementById('map'), app.model.mapOptions);
          
          // creates a Google place search service object. PlacesService does the work of
          // actually searching for location data.
          app.ViewModel.service = new google.maps.places.PlacesService(self.map);

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
          var name = placeData.formatted_address;   // name of the place from the place service
          var bounds = window.mapBounds;            // current boundaries of the map window

          // marker is an object with additional data about the pin for a single location
          var marker = new google.maps.Marker({
            map: self.map,
            position: placeData.geometry.location,
            title: name,
            place_id: placeData.place_id,
            draggable: true,
            animation: google.maps.Animation.DROP

          });


          // add markers to marker array
          self.markers.push(marker);


          google.maps.event.addListener(marker, 'click', function() {
              app.model.currentMarker = null;
              app.model.currentMarker = marker;
              app.model.placeDetailsByPlaceId(app.model.currentMarker);
          });

          marker.addListener('click', self.toggleBounce);

          // this is where the pin actually gets added to the map.
          // bounds.extend() takes in a map location object
          bounds.extend(new google.maps.LatLng(lat, lon));
          // fit the map to the new marker
          self.map.fitBounds(bounds);
          // center the map
          self.map.setCenter(bounds.getCenter());
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
              
          } else{
            window.alert('Error, Try Again');
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
                  var request = { query: place.formatted_address };

                  // Actually searches the Google Maps API for location data and runs the callback
                  // function with the search results after each search.
                  app.ViewModel.service.textSearch(request, self.callback);

          });
        };

        // Sets the boundaries of the map based on pin locations
        window.mapBounds = new google.maps.LatLngBounds();

        // pinPoster(locations) creates pins on the map for each location in
        // the locations array
        self.pinPoster();

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
                     self.setMapOnAll(self.map); 
                  }

                  if (markerStr.toLowerCase().indexOf(filter) !== -1) {
                      self.addMarker(index,self.map);
                  }

              });
          };


          self.filter = ko.observable("");
          self.initialize = true;

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
              app.model.currentMarker = null;
              app.model.currentMarker = marker;
              toggleBounce();
              app.model.placeDetailsByPlaceId(app.model.currentMarker);
          };



          // @description Vanilla JS way to listen for resizing of the window
          // and adjust map bounds
          window.addEventListener('resize', function(e) {
            //Make sure the map bounds get updated on page resize
           self.map.fitBounds(mapBounds);
          });




    }
    
};
ko.applyBindings(new app.ViewModel());


