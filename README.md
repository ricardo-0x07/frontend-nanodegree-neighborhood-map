# frontend-nanodegree-neighborhood-map
This project displays place i am interested in and details about it and other places nearby.
This project was created as part of the Frontend Nano Degree Programme i did with Udacity

## Installation

1. Enter the following url in a browser and press enter: http://ricardo-0x07.github.io/frontend-nanodegree-neighborhood-map.
2. Fork the repository, download it and open the index.html the dist folder in a browser.


## Usage
1. After the application has been loaded successfully, you may click on the markers to see details of interest.
2. use the search field above the list displayed on the left to search for a specific location(s).
3. you may also click on addresses displayed in the list to see details for the locations displayed over the respective markers.
4. On a small mobile device the list is hidden by default you may access it by clicking the hamberger button. once you select a list item the list will collapse aging and display the may with info window for the marker you selected.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

1. initially created as part of a frontend nano degree program i did with udacity in march of 2015.

## Credits

1. The udacity nano degree team provided the guidance and training i required to complete the initial version of this project.

## License

TODO: Write license

## changelog
2016-03-24: made updates 

1. fix applications responsiveness.
2. replaced the code that used jquery to implement view model logic with code that used knockoutjs
3. List view now visible on smaller screens.
4. modified locations array to a simple array of strings.
5. implemented handlebars js templating 
6. Used fail() instead of error
7. effort made indentation issues as far as practical

2016-03-26

1. implemented the gulp build tool together with the the following plugins
 - gulp-jshint, gulp-sass, gulp-concat, gulp-uglify, gulp-eslint, gulp-autoprefixer, browser-sync, eslint-config-google, gulp-jasmine-phantom, gulp-sourcemaps, gulp-imagemin, imagemin-pngquant
2. Fixed yelp api error handling issue
3. Implemented gulp task to deploy to gh-pages
4. implemented gulp tasks to process and minify css, js and images
5. Corrected issue with app.ViewModel() loading before Google Maps data request has completed.

2016-03-29

1. Began refactoring code into separate files app.js and helper.js.
2. Re-factored code to only one instance of the infowindow. This apparently helped speed up opening of infowindow.
3. Corrected issue with placeCallBack error and error log warning.
4. Corrected some code quality issues.
5. re-factored code to center marker on click.
6. Re-factored code to trigger markers click event when a list item is selected.
7. Implemented infowindow spinner.

2016-4-02

1. Refactored code to use MVVM pattern to log warnings to the UI by using template binding
2. Eliminate redundant google api requests
3. Refactored to center map on selected marker 
4. Corrected error logging issues
5. Optimized code

#Versioning
 Version 4.




