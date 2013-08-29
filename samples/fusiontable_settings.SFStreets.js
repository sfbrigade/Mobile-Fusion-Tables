/*!
 * Customization file for Fusion Table Mobile Templates
 * See maps_lib.js for license and repository
 *
 * REPLACE THE SETTINGS BELOW TO REFER TO YOUR OWN DATA.
 *
 * Required:
 * 1. Fusion Table IDs
 *
 * Overrides (optional):
 * 2. Map Preferences
 *   - How It Should Use Your Nearby Location
 * 3. Custom Content
 *   - Title
 *   - About Page
 *   - Infobox (popup when you click on a location)
 * 4. Search Settings
 *   - Default is a field for every column if you don't set this
 */

var MapsLib = MapsLib || {};


  /////////////////////////
  // 1. FUSION TABLE IDs //
  /////////////////////////

  // Using v1 Fusion Tables API
  // See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  // The encrypted Table ID of your Fusion Table (found under File => About)
  MapsLib.fusionTableId = "10zr7wF49yQWKB4A0vAtoKPfvvBPPZQ8BVEfAqDw";

  // *New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  // *Important* this key is for demonstration purposes. please register your own.
  MapsLib.googleApiKey ="AIzaSyAMVBSXes-6P-gWaxRj20GK8NT6WDVpozM";


  // YOU CAN DELETE EVERYTHING AFTER THIS POINT AND STILL HAVE A WORKING APP. //
  // EVERYTHING BELOW IS CUSTOM OVERRIDES TO MAKE YOUR APP EVEN MORE AWESOME. //


$.extend(MapsLib, {

  ////////////////////////
  // 2. MAP PREFERENCES //
  ////////////////////////

  // Override the location column in your Fusion Table (useful if you have multiple columns)
  // NOTE: if you have "latitude" and "longitude" columns, just use "latitude"
  //locationColumn:     "Geometry",

  // Center that your map defaults to
  mapDefaultCenter: new google.maps.LatLng(37.77, -122.45), // center of San Francisco

  // Using Fusion Table's "zoom" levels, where X+1 zooms in to half the radius of X.
  // A zoom level of 14 = radius of 1 mile visible on an iPhone
  defaultZoom: 11,    // zoom level when using mapDefaultCenter

  // Set useNearbyLocation to false if you don't want to get the user's location.
  useNearbyLocation: {
    startAtNearbyLocation:  true,

    // onlyIfWithin: (comment out if you always want to use nearby location)
    // "X miles" or "X meters" = if we're within this distance from mapDefaultCenter, use nearby location.
    //                           otherwise, post boundsExceededMessage (if exists) and use mapDefaultCenter.
    onlyIfWithin:           "6 miles",
    boundsExceededMessage:  "Your location is far away from San Francisco.  Defaulting to city limits.",

    // start at this zoom if starting at nearby location
    nearbyZoom:             15,

    // Snap to nearby zoom level when user hits "Nearby"?  Options are:
    // true               = always snap to zoom level
    // false (default)    = never snap to zoom level
    // int                = snap to zoom level if current zoom is more then specified levels away (X level = 2^X magnitude)
    snapToNearbyZoom:       3
  },


  ///////////////////////
  // 3. CUSTOM CONTENT //
  ///////////////////////

  // Title bar (including title of website)
  title: "SF Streets",

  // Contents of the About Page.  You can use "{title}" to insert your title.
  aboutPage: " \
    <h3>About {title}</h3> \
    <p>This is a demonstration of a Mobile Template using Fusion Tables.  Developed by SF Brigade for Code For America, it's an adaptation of Derek Eder's searchable Fusion Table template, licensed under the <a href='https://github.com/derekeder/FusionTable-Map-Template/wiki/License' target='_blank'>MIT License</a>.  This particular application uses SF street data provided by the SFCTA.</p> \
    <p>To use this template for your own Fusion Table data, <a href='https://github.com/sfbrigade/Mobile-Fusion-Tables' target='_blank'>clone this repository</a> and replace the fields inside fusiontable_settings.js to match your content.</p> \
    ",

  // This will go in your style block.  Useful if customizing your infoboxes.
  customCSS: " \
    .infobox-header, .ui-li-desc, #entity-text { font-family: Arial, Helvetica, Geneva, sans-serif; white-space:normal; } \
    .infobox-subheader { padding-top: 5px; } \
    .infobox-map { width:220px; } \
    .infobox-header { display:inline; text-transform:uppercase; padding-right: 10px; } \
  ",

  // Handlebars template using the following variables:
  //  - row.COLUMN_NAME, returns value for given column in your FusionTable row
  //  - isListView, which evaluates to:
  //      - false when populating a map infobox
  //      - true when populating an entry in "List" view

  // Set this to "" if you don't want infoboxes.
  // Comment out completely to fall back on the infobox format from Fusion Table
  customInfoboxTemplate: ' \
          {{#if isListView}} \
            <div> \
          {{else}} \
            <div class="infobox-map"> \
          {{/if}} \
          <h4 class="infobox-header">{{row.Project_Name}}</h4> \
          <p class="ui-li-desc infobox-subheader"><br> \
          <strong>{{row.Project_Type}}</strong></p> \
          <p class="ui-li-desc">Cost Estimate: {{row.Total_Project_Cost_Estimate}} \
          <br>Completion Date: {{row.Project_Completion_Expected}} \
          {{#if isListView}} \
          {{else}} \
            {{#if row.Project_Details_Page}} \
              <br><a href="{{row.Project_Details_Page}}" target="_blank">{{row.Project_Details_Page}}</a> \
            {{/if}} \
          {{/if}} \
          </p></div>',

  // Infoboxes will also appear (unless blank) on your nearby or search address pins.
  // HTML is OK.  Use "{address}" to denote the entered address for addressPinInfobox.
  nearbyPinInfobox: "You are here.",
  addressPinInfobox: "{address}",


  ////////////////////////
  // 4. SEARCH SETTINGS //
  ////////////////////////

  // Appended/Assumed for all address searches
  // Format: [City,] STATE.  (can be null/empty)  
  addressScope:      "San Francisco, CA",      

  // Search Page:
  // By default, you will get a text field for each column.
  // However, you can customize search settings using the following attributes:
  //
  //  - allColumns (default=true):            a text field will appear for each column.
  //
  //  - allColumnsExactMatch (default=false): allColumns + exact matching of fields.
  //
  //  - searchByAddress (default=true):       show address field for centering search
  // 
  //  - distanceFilter: drop-down for restricting search results by distance to address (or nearby).  Comment this out to have no such drop-down.
  //     - filterSearchResults (default=true): limit search results to those within distance
  //     - filterListResults (default=true): limit list results to those within distance (otherwise they're just ordered nearest-first)
  //     - dropDown: array of drop-down options for distance from address
  //       - Each entry is an array of [zoom level, label for drop-down, true if default selection]
  //       - You can specify zoom level 0 for an option to not filter by distance, and leave zoom as-is.
  //
  //  - dropDowns: array of custom drop-downs, where an entry has the following attributes:
  //       - label
  //       - options: array of drop-down entries.  Each entry is an array of [label, Fusion Table SQL-style WHERE clause, true if default selection]
  //
  //  - columns: array of column fields, where a field has the following attributes:
  //       - label
  //       - column: name of column
  //       - exact_match (default=false, meaningless if options is specified): look for exact match instead of a contains match
  //  If "allColumns" is true, "columns" will simply override label/match settings for the specified columns

  //searchPage: {} // use this to just get a text field for each column
  searchPage: { 
    allColumns: false
    ,dropDowns: [
      { label: "Cost Range", options: [
        ["Any", "", true],
        ["At least $1M", "'Total Project Cost Estimate' LIKE '$%_,___,___'"],
        ["At least $10M", "'Total Project Cost Estimate' LIKE '$%__,___,___'"],
        ["At least $100M", "'Total Project Cost Estimate' LIKE '$%___,___,___'"]
      ] }
    ]
    ,columns: [
      { label: "Project Type", column: "Project Type", exact_match: false }
    ]
  },

});
