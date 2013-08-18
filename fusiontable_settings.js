/*!
 * Customization file for Fusion Table Mobile Templates
 * See maps_lib.js for license and repository
 *
 * REPLACE THE SETTINGS BELOW TO REFER TO YOUR OWN DATA.
 * 1. Fusion Table IDs
 * 2. Map Preferences
 * 3. Custom Content
 *   - Title
 *   - About Page
 *   - Infobox (popup when you click on a location)
 * 4. Search Settings
 *   - Default is a field for every column if you set this to nothing
 */

var MapsLib = MapsLib || {};
$.extend(MapsLib, {


  /////////////////////////
  // 1. FUSION TABLE IDs //
  /////////////////////////

  // Using v1 Fusion Tables API
  // See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  // The encrypted Table ID of your Fusion Table (found under File => About)
  fusionTableId:      "1kjZeEXWdu2NmsWKFnMoqek4f0EV-dVIJjxMHg6w",

  // *New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  // *Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyAMVBSXes-6P-gWaxRj20GK8NT6WDVpozM",

  // Name of the location column in your Fusion Table.
  // NOTE 1: if your location column name has spaces in it, surround it with single quotes
  // NOTE 2: if you have "latitude" and "longitude" columns, just use "latitude"
  locationColumn:     "latitude",
  

  ////////////////////////
  // 2. MAP PREFERENCES //
  ////////////////////////

  // Center that your map defaults to
  mapDefaultCenter: new google.maps.LatLng(37.77, -122.45), // center of San Francisco

  // Using Fusion Table's "zoom" levels, where X-1 covers twice the radius of X.
  // A zoom level of 14 = radius of 1 mile visible on an iPhone
  mapDefaultCenterZoom: 11,    //zoom level when using mapDefaultCenter
  nearbyZoom:           17,    //zoom level when using nearby location

  // When you launch the page or search without specifying an address, 
  //  should we use your nearby location?  Options are:
  // "always"                = always use nearby location
  // "never"                 = always use mapDefaultCenter
  // "X miles" or "X meters" = if we're within this distance from mapDefaultCenter, use nearby location.
  //                           otherwise, post boundsExceededMessage (if exists) and use mapDefaultCenter
  useNearbyLocationIfWithin: "5 miles",

  boundsExceededMessage:  "Your location is far away from San Francisco.  Defaulting to city limits.",


  ///////////////////////
  // 3. CUSTOM CONTENT //
  ///////////////////////

  // Title bar (including title of website)
  title: "Inspection Data",

  aboutPage: " \
    <h3>About Inspection Data</h3> \
    <p>This is a demonstration of a Mobile Template using Fusion Tables.  Developed by SF Brigade for Code For America, it's an adaptation of Derek Eder's searchable Fusion Table template, licensed under the <a href='https://github.com/derekeder/FusionTable-Map-Template/wiki/License' target='_blank'>MIT License</a>.  This particular application uses health inspection data for businesses in San Francisco.</p> \
    <p>To use this template for your own Fusion Table data, <a href='https://github.com/sfbrigade/FusionTable-Map-MobileTemplate' target='_blank'>clone this repository</a> and replace the fields inside fusiontable_settings.js to match your content.</p> \
    ",

  // This will go in your style block.  Use this to format your infoboxes.
  customCSS: " \
    .infobox-container-map { width:220px; } \
    .infobox-header { display:inline; padding-right: 10px; } \
    .infobox-subheader { padding-top: 5px; } \
    .moreinfo { margin-left:7px; min-width:18px; position:absolute; \
        top:45%; bottom:45%; min-height:18px; } \
    .score { float:left; font-size:medium; padding:5px; border:1px solid black; margin:2px 7px 5px 0px; } \
    .score.grn_blank { background-color: #00de3c; color:white; } \
    .score.ltblu_blank { background-color: #55d7d7; color: white; } \
    .score.orange_blank { background-color: #ff9c00; color: white; } \
    .score.red_blank { background-color: #fb6155; color: white; } \
  ",

  // Handlebars template using the following variables:
  //  - row.COLUMN_NAME, returns value for given column in your FusionTable row
  //  - isListView, which evaluates to:
  //      - false when populating a map infobox
  //      - true when populating an entry in "List" view

  // Leave blank if you don't want infoboxes.
  infoboxTemplate: " \
          {{#if isListView}} \
            <div class='infobox-container'> \
          {{else}} \
            <div class='infobox-container-map'> \
          {{/if}} \
          <div class='score {{row.last_score_category}}'>{{row.last_score}}</div> \
          <h4 class='infobox-header'>{{row.name}}</h4> \
          <p class='ui-li-desc infobox-subheader'> \
            <strong>Last inspected: {{row.last_inspection_date}}</strong></p> \
          {{#if isListView}} \
          {{else}} \
            <p class='ui-li-desc'>{{row.address}} \
              <br/><br/><b>Recent violations:</b> \
              {{#if row.violation_1}} \
                <br>-{{row.violation_1}} \
              {{else}} \
                None \
              {{/if}} \
              {{#if row.violation_2}} \
                <br>-{{row.violation_2}} \
              {{/if}} \
              {{#if row.violation_3}} \
                <br>-{{row.violation_3}} \
              {{/if}} \
            {{/if}} \
          </p></div>",

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
  //  - allColumns (default=true):            a text field will appear for each column.
  //  - allColumnsExactMatch (default=false): allColumns + exact matching of fields.
  //  - addressFilter: settings for address search field.  Comment this out to have no address search field.
  //     - filterByDistance (default=true): limit search results to selected distance
  //     - distances: array of drop-down options for distance from address
  //       - Each entry is an array of [zoom level, label for drop-down, true if default selection]
  //       - You can specify zoom level 0 for an option to not filter by distance, and leave zoom as-is.
  //  - dropDowns: array of custom drop-downs, where an entry has the following attributes:
  //       - label
  //       - options: array of drop-down entries.  Each entry is an array of [label, Fusion Table SQL-style WHERE clause, true if default selection]
  //  - columns: array of column fields, where a field has the following attributes:
  //       - label
  //       - column: name of column
  //       - exact_match (default=false, meaningless if options is specified): look for exact match instead of a contains match
  //  If "allColumns" is true, "columns" will simply override label/match settings for the specified columns

  //searchPage: {} // use this to just get a text field for each column
  searchPage: { 
    allColumns: false,
    addressFilter: { 
      filterByDistance: true,
      distances: [ [0, "Anywhere"], [16, "2 blocks", true], [15, "1/2 mile"], [14, "1 mile"], [13, "2 miles"] ]
    },
    dropDowns: [ 
      { label: "Rating Filter", options: [
        ["Any Rating", "'last_score' > 0", true],
        ["Good", "'last_score' > 90"],
        ["Adequate", "'last_score' > 85 AND 'last_score' <= 90"],
        ["Needs Improvement", "'last_score' > 70 AND 'last_score' <= 85"],
        ["Poor", "'last_score' <= 70 AND 'last_score' > 0"]
      ] }
    ]
    //,columns: [
    //  { label: "Violation", column: "violation_1", exact_match: false }
    //]
  },

});
