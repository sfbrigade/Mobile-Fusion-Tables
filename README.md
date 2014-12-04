Mobile Fusion Tables
====================

A mobile-ready template using Fusion Tables and jQuery Mobile, originally based on Derek Eder's [Fusion Table Searchable Map Template](https://github.com/derekeder/FusionTable-Map-Template).

This is an SF Brigade project for Code for America. Started by Mark Brenig-Jones, completed by Rego Sen, with contributions from Sidney Zhang and Andrew Byrne.

Demos
-----

- US Health Centers: http://codeforsanfrancisco.org/Mobile-Fusion-Tables/demo-USHealthCenters.html
- SF Bank Locations: http://codeforsanfrancisco.org/Mobile-Fusion-Tables/demo-SFBanks.html
- SF Restaurant Inspections: http://codeforsanfrancisco.org/Mobile-Fusion-Tables/demo-SFInspections.html
- SF Liquefaction Data: http://codeforsanfrancisco.org/Mobile-Fusion-Tables/demo-SFLiquefaction.html
- SFCTA Projects: http://codeforsanfrancisco.org/Mobile-Fusion-Tables/demo-MyStreetSF.html

Here are some web apps that now use Mobile Fusion Tables:

- <a href="http://www.toynbeeidea.com" target="_blank">Toynbee Tile Map</a>
- <a href="http://trsmap.com" target="_blank">The Rider Scope</a> (snowmobile trails in NY State)
- <a href="https://googledrive.com/host/0B4-O5VDQHQmPT3RvTVNMbmlYS2s/" target="_blank">UK Fabrication Companies</a>

Demo Using Your Own Fusion Table
--------------------------------
Go to http://codeforsanfrancisco.org/Mobile-Fusion-Tables and enter your Fusion Table URL (or ID) to see what your data will look like with Mobile Fusion Tables.

(Note that you'll be seeing it with default settings- see below for customizing it to your own needs.)


Setup
-----

**To create your own web app with Mobile Fusion Tables:**

1. Clone this repository.
2. Replace the FusionTable ID at the top of fusiontable_settings.js to point to your own table.

That's it.  You now have a working site that's equivalent to the above demo.  It uses your own table's data, title, description, and infobox content, with a search field or range slider for each column.  Once you open the webpage on your device and hit "Add to Home Screen", you should have something that looks and feels like a mobile app.

If you want to make your app even sexier, explore the rest of the settings file to customize your content and behavior.  See the "samples" folder to see how the above demos were customized. 


Turn It Into A Native App
-------------------------

You can combine Mobile Fusion Tables with a wrapper like <a href="http://phonegap.com" target="_blank">Phonegap</a> to build a pure mobile app.

For example, here's the <a href="https://play.google.com/store/apps/details?id=com.moto.theriderscope" target="_blank">Android version</a> of The Rider Scope app featured above.
  
  
Walkthrough
-----------

Here's what the main (map) page looks like.  You can customize the contents of the infobox using Handlebars.

![Map](http://sfbrigade.github.io/Mobile-Fusion-Tables/readme-images/map.png)

There are four buttons for navigating:
- **Search**: customizable search page for filtering and finding
- **List**: shows results in a customizable list view
- **Nearby**: takes you to your current location (you can opt-out of using current location in the settings file)
- **About**: fill this with your custom description and links

By default, the search page gives you a range slider for every number/date column in your table, and a text field for every string column (plus an address for centering your search).

![Default Search](http://sfbrigade.github.io/Mobile-Fusion-Tables/readme-images/search-default.png)

You can customize your search page with drop-downs, overrides, and other options:

![Custom Search](http://sfbrigade.github.io/Mobile-Fusion-Tables/readme-images/search-custom.png)

The address field lets you auto-complete an address:

![Autocomplete](http://sfbrigade.github.io/Mobile-Fusion-Tables/readme-images/autocomplete.png)

The list view shows the data / search results by row (whose contents you can also customize). Clicking on a row will take you back to the map and highlight the pin with an infobox.

![List View](http://sfbrigade.github.io/Mobile-Fusion-Tables/readme-images/listview.png)


Get Involved
------------

If you have a customization that you'd like to share here, we'd be happy to add it to the "samples" folder.

Please raise any issues or suggestions for improvement!
