Mobile Fusion Tables
====================

This is a mobile-ready template using Google Maps and Fusion Tables, based on Derek Eder's [Fusion Table Searchable Map Template](https://github.com/derekeder/FusionTable-Map-Template).

**To use this template for your own Fusion Table data:**

1. Clone this repository.
2. Replace the fields inside fusiontable_settings.js to match your content.  (See the 'samples' folder for more examples.)

Here's what the main (map) page looks like.  You can customize the contents of the infobox using Handlebars.

![Map](http://sfbrigade.github.io/FusionTable-Map-MobileTemplate/readme-images/map.png)

There are four buttons for navigating:
- **Search**: customizable search page for filtering and finding
- **List**: shows results in a customizable list view
- **Nearby**: takes you to your current location (you can opt-out of using current location in the settings file)
- **About**: fill this with your custom description and links

Here's the list view. Clicking on a row will take you back to the map and highlight the pin with an infobox.

![List View](http://sfbrigade.github.io/FusionTable-Map-MobileTemplate/readme-images/listview.png)

By default, the search page gives you a text field for every user column from your table (plus an address for centering your search):

![Default Search](http://sfbrigade.github.io/FusionTable-Map-MobileTemplate/readme-images/search-default.png)

You can customize this with drop-downs and other options:

![Custom Search](http://sfbrigade.github.io/FusionTable-Map-MobileTemplate/readme-images/search-custom.png)

The address field uses geocomplete, which lets you auto-complete an address:

![Geocomplete](http://sfbrigade.github.io/FusionTable-Map-MobileTemplate/readme-images/geocomplete.png)


Demo:
-----

The gh-pages branch is used to host this template example. You can access it from either link below:
- http://sfbrigade.github.io/FusionTable-Map-MobileTemplate/
- http://bit.ly/fusion-mobile
