/*!
 * Customization file for Fusion Table Mobile Templates
 * See maps_lib.js for license and repository
 *
 * REPLACE THE SETTINGS BELOW TO REFER TO YOUR OWN DATA.
 * COLUMN NAMES ARE CASE-SENSITIVE!
 *
 * Required:
 * 1. Fusion Table IDs
 *
 * Overrides (optional):
 * 2. Search Settings
 *   - Default is a field for every column if you don't set this
 * 3. Custom Content
 *   - Title
 *   - About Page
 *   - Infobox (popup when you click on a location)
 * 4. Map Preferences
 *   - How It Should Use Your Nearby Location
 */

var MapsLib = MapsLib || {};


  /////////////////////////
  // 1. FUSION TABLE IDs //
  /////////////////////////

  // Using v1 Fusion Tables API
  // See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  // The encrypted Table ID of your Fusion Table (found under File => About)
  MapsLib.fusionTableId = "13xmU6wANRJb0Niqcdz5Tr0xWh4AyV0yN10xMxPc";

  // *New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  // *Important* this key is for demonstration purposes. please register your own.
  MapsLib.googleApiKey ="AIzaSyAMVBSXes-6P-gWaxRj20GK8NT6WDVpozM";


  // YOU CAN DELETE EVERYTHING AFTER THIS POINT AND STILL HAVE A WORKING APP. //
  // EVERYTHING BELOW IS CUSTOM OVERRIDES TO MAKE YOUR APP EVEN MORE AWESOME. //


$.extend(MapsLib, {

  ////////////////////////
  // 2. SEARCH SETTINGS //
  ////////////////////////
  
  // By default, you will get a text field for each column.
  // However, you can customize search settings using the following attributes:
  //
  //  - allColumns (default=true):             a text field will appear for each column.
  //
  //  - allColumnsExactMatch (default=false):  allColumns + exact matching of fields.
  //
  //  - addressShow (default=true):            show address field for centering search
  //
  //  - addressAutocomplete:                   autocomplete options for address field (set to false if you don't want autocomplete)
  //     - country (default="US"):             restrict autocomplete to search within said country (2-character country code)
  //     - useDefaultMapBounds (default=true): addresses within defaultMapBounds (see section 4) will be prioritized to the top of autocomplete results
  // 
  //  - distanceFilter: drop-down for restricting search results by distance to address (or nearby).  Comment this out to have no such drop-down.
  //     - filterSearchResults (default=true): limit search results to those within distance
  //     - filterListResults (default=true):   limit list results to those within distance (otherwise they're just ordered nearest-first)
  //     - dropDown:                           array of drop-down entries for distance from address.  Each entry is an array of:
  //          1. drop-down text
  //          2. radius length as "X miles" or "X meters" if the drop-down text wasn't already in this format.
  //          3. true if this is the default selection
  //       - You can specify "0" for radius length to not filter by distance, and leave zoom as-is.
  //
  //  - dropDowns: array of custom drop-downs, where an entry has the following attributes:
  //       - label
  //       - options: array of drop-down entries.  Each entry is an array of:
  //          1. drop-down text
  //          2. Fusion Table SQL-style WHERE clause (overrides template)
  //             - see https://developers.google.com/fusiontables/docs/v1/sql-reference for Fusion Table-friendly WHERE clauses
  //          3. true if this is the default selection
  //       - template (optional): template for WHERE clause, using {text} to insert drop-down text
  //         NOTE: if you use a template, a drop-down entry can be just the drop-down text instead of an array.
  //
  //  - columns: array of column fields, where a field has the following attributes:
  //       - label
  //       - column: name of column
  //       - exact_match (default=false, meaningless if options is specified): look for exact match instead of a contains match
  //       - range (numbers and dates only, default=true): use this if you want a range slider.  Looks up minimum and maximum values for column.
  //
  //  If "allColumns" is true, "columns" will simply override label/match settings for the specified columns
  //  Fields for numerical columns use exact match- they have no support for contains match.
  //    (Create a drop-down to search within ranges in numerical value.)

  searchPage: { 
    allColumns: false,
    distanceFilter: { 
      dropDown: [ ["Anywhere", "0", true], ["2 blocks", "400 meters"], ["1/2 mile", ".5 miles"], ["1 mile"], ["2 miles"] ]
    },
    dropDowns: [ 
      { label: "Rating Filter", options: [
        ["Any Rating", "'last_score' > 0", true],
        ["Good", "'last_score' > 90"],
        ["Adequate", "'last_score' > 85 AND 'last_score' <= 90"],
        ["Needs Improvement", "'last_score' > 70 AND 'last_score' <= 85"],
        ["Poor", "'last_score' <= 70 AND 'last_score' > 0"]
      ] }
    ],
    columns: [
      {label: "Name", column: "name"},
      {label: "Violations", column: "violations"}
    ],
  },


  ///////////////////////
  // 3. CUSTOM CONTENT //
  ///////////////////////

  // Title bar (including title of website)
  title: "SF Food Inspections",

  // Contents of the About Page.  You can use "{title}" to insert your title.
  aboutPage: " \
    <h3>About {title}</h3> \
    <p>This is a demonstration of a Mobile Template using Fusion Tables.  Developed by SF Brigade for Code For America, it's an adaptation of Derek Eder's searchable Fusion Table template, licensed under the <a href='https://github.com/derekeder/FusionTable-Map-Template/wiki/License' target='_blank'>MIT License</a>.  This particular application uses health inspection data for businesses in San Francisco.</p> \
    <p>To use this template for your own Fusion Table data, <a href='https://github.com/sfbrigade/Mobile-Fusion-Tables' target='_blank'>clone this repository</a> and replace the fields inside fusiontable_settings.js to match your content.</p> \
    ",

  // This will go in your style block.  Useful if customizing your infoboxes.
  customCSS: " \
    .infobox-header, .ui-li-desc, li, #score-text { font-family: Arial, Helvetica, Geneva, sans-serif; white-space:normal;} \
    .infobox-map { width:220px; height:107px;} \
    .infobox-header { display:inline; padding-right: 10px; } \
    .infobox-subheader { padding-top: 5px; } \
    .moreinfo { margin-left:7px; min-width:18px; position:absolute; \
        top:45%; bottom:45%; min-height:18px; } \
    .score { float:left; font-size:medium; padding:5px; border:1px solid black; margin:2px 7px 5px 0px; } \
    .score.grn_blank { background-color: #00de3c; color: white; } \
    .score.ltblu_blank { background-color: #55d7d7; color: white; } \
    .score.orange_blank { background-color: #ff9c00; color: white; } \
    .score.red_blank { background-color: #fb6155; color: white; } \
  ",

  // customInfoboxHtml can be defined as a string or a function:
  //  STRING:   You can embed Handlebars expressions and variables.
  //  FUNCTION: Returns an HTML string and takes two params: row and isListView
  //  "":       No infobox.
  //  Default (leaving it undefined): falls back on the infobox format from Fusion Table
  //
  //  In either case, the variables are defined as follows:
  //  - row.COLUMN_NAME, returns value for given column in your FusionTable row
  //      - Note: COLUMN_NAME has periods omitted, and spaces replaced with underscores
  //      - Example: to get the value from the "U.S. Entity Type" column, use row.US_Entity_Type
  //  - isListView, which evaluates to:
  //      - false when populating a map infobox
  //      - true when populating a row in the "List" view

  // delimitedColumns (optional): specify delimiter per column, and row.COLUMN_NAME will return an array
  delimitedColumns: {"violations": ";"},

  // listViewSortByColumn (optional): specify column to sort by, instead of sorting by distance
  //                                  append "DESC" to sort in reverse
  //listViewSortByColumn: "name",

  customInfoboxHtml: " \
    {{#if isListView}} \
      <div> \
    {{else}} \
      <div class='infobox-map'> \
    {{/if}} \
    <div class='score {{row.last_score_category}}'><span id='score-text'>{{row.last_score}}</span></div> \
    <h4 class='infobox-header'>{{row.name}}</h4> \
    <p class='ui-li-desc infobox-subheader'> \
    {{#if isListView}} \
      {{row.address}}</p> \
    {{else}} \
      <strong>Last inspected: {{row.last_inspection_date}}</strong> \
      <br>{{row.address}}</p> \
      <p class='ui-li-desc infobox-subheader'> \
      {{#if row.violations}} \
        <b>Recent violations ({{row.violations.length}}):</b> \
        {{#each row.violations}} \
          <br>- {{this}} \
        {{/each}} \
      {{else}} \
        <b>Recent violations:</b> None \
      {{/if}} \
    {{/if}} \
    </p></div>",

  // Infoboxes will also appear (unless blank) on your nearby or search address pins.
  // HTML is OK.  Use "{address}" to denote the entered address for addressPinInfobox.
  nearbyPinInfobox: "You are here.",
  addressPinInfobox: "{address}",


  ////////////////////////
  // 4. MAP PREFERENCES //
  ////////////////////////

  // Override the location column in your Fusion Table (useful if you have multiple columns)
  // NOTE: if you have "latitude" and "longitude" columns, just use "latitude"
  //locationColumn:     "latitude",

  // Center and zoom radius that your map defaults to when location services are off.
  // If useDefaultMapBounds is true (see section 2), this also determines which addresses get priority with autocomplete
  defaultMapBounds: {

    // Use [latitude, longitude] or address
    center: "San Francisco, CA",

    // "X miles" or "X meters"
    radius: "6 miles"
  },

  // Set useNearbyLocation to false if you don't want to get the user's location.
  useNearbyLocation: {
    startAtNearbyLocation:      true,

    // If true: use nearby location only if we're within default map bounds
    //          otherwise, post boundsExceededMessage (if non-empty) and use mapDefaultCenter.
    onlyWithinDefaultMapBounds: true,
    boundsExceededMessage:      "Your location is far away from San Francisco.  Defaulting to city limits.",

    // use this zoom radius if starting at nearby location
    nearbyZoomRadius:           "200 meters",

    // Snap to nearby zoom radius when user hits "Nearby"?  Options are:
    // true             = always snap to zoom level
    // false (default)  = never snap to zoom level
    // int              = snap to zoom level if ratio between current and nearby zoom radii
    //                      is greater than this (in either direction)
    snapToNearbyZoomIfRatioGreaterThan: 8
  },

  // mapOverlays is an array of overlays, where each overlay can be either of the following:
  // A. a FusionTable ID
  // B. an entry with the following attributes (representing a "ground overlay"):
  //       - imageURL: url to the image to overlay on the map
  //       - cornerNW: [latitude, longitude] of the overlay's NW corner
  //       - cornerSE: [latitude, longitude] of the overlay's SE corner
  //       - opacityPercent (default = 50):
  //            0 = completely invisible
  //            100 = completely opaque

  // mapOverlays: []
  
});
