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
  MapsLib.fusionTableId = "1GBiESlYt_Lc9O5PLuLaii1L74HeY7G4O1fMh9OE";

  // *New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  // *Important* this key is for demonstration purposes. please register your own.
  MapsLib.googleApiKey ="AIzaSyAMVBSXes-6P-gWaxRj20GK8NT6WDVpozM";


  // YOU CAN DELETE EVERYTHING AFTER THIS POINT AND STILL HAVE A WORKING APP. //
  // EVERYTHING BELOW IS CUSTOM OVERRIDES TO MAKE YOUR APP EVEN MORE AWESOME. //


$.extend(MapsLib, {

  ////////////////////////
  // 2. SEARCH SETTINGS //
  ////////////////////////

  // Search Page:
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
  //          2. Fusion Table SQL-style WHERE clause
  //             - see https://developers.google.com/fusiontables/docs/v1/sql-reference for Fusion Table-friendly WHERE clauses
  //          3. true if this is the default selection
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
      dropDown: [ ["Anywhere", "0", true], ["2 miles"], ["8 miles"], ["100 miles"], ["500 miles"] ]
    },
    dropDowns: [ 
      { label: "Organization Type", options: [
        ["Any", "", true],
        [".gov", "'Grantee Organization Type Description' = 'U.S. Government Entity'"],
        [".com", "'Grantee Organization Type Description' = 'Corporate Entity, Federal Tax Exempt'"],
        [".org", "'Grantee Organization Type Description' NOT EQUAL TO 'Corporate Entity, Federal Tax Exempt' AND 'Grantee Organization Type Description' NOT EQUAL TO 'U.S. Government Entity'"]
      ] }
    ],
    columns: [
      { label: "Name", column: "Name", exact_match: false }
    ]
  },


  ///////////////////////
  // 3. CUSTOM CONTENT //
  ///////////////////////

  // Title bar (including title of website)
  title: "U.S. Health Centers",

  // Contents of the About Page.  You can use "{title}" to insert your title.
  aboutPage: " \
    <h3>About {title}</h3> \
    <p>This is a demonstration of a Mobile Template using Fusion Tables.  Developed by SF Brigade for Code For America, it's an adaptation of Derek Eder's searchable Fusion Table template, licensed under the <a href='https://github.com/derekeder/FusionTable-Map-Template/wiki/License' target='_blank'>MIT License</a>.  This particular application uses data from the <a href='http://datawarehouse.hrsa.gov/Download_HCC_LookALikes.aspx' target='_blank'>HRSA</a>.</p> \
    <p>To use this template for your own Fusion Table data, <a href='https://github.com/sfbrigade/Mobile-Fusion-Tables' target='_blank'>clone this repository</a> and replace the fields inside fusiontable_settings.js to match your content.</p> \
    ",

  // This will go in your style block.  Useful if customizing your infoboxes.
  customCSS: " \
    .infobox-header, .ui-li-desc, #entity-text { font-family: Arial, Helvetica, Geneva, sans-serif; white-space:normal;} \
    .infobox-subheader { padding-top: 5px; } \
    .infobox-map { width:220px; } \
    .infobox-header { display:inline; padding-right: 10px; } \
    .moreinfo { margin-left:7px; min-width:18px; position:absolute; \
        top:45%; bottom:45%; min-height:18px; } \
    .entity { float:left; font-size:medium; padding:5px; border:1px solid black; margin:2px 7px 5px 0px; } \
    .entity.blue_box { display: none; background-color: #0060ed; color: white; } \
    .entity.red_box { display: none; background-color: #fb6155; color: white; } \
    .entity.orange_box { background-color: #ff9c00; color: white; } \
    .entity.blue_box.Government { display: inherit; } \
    .entity.red_box.Corporate { display: inherit; } \
    .entity.orange_box.Government { display: none; } \
    .entity.orange_box.Corporate { display: none; } \
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

  customInfoboxHtml: ' \
    {{#if isListView}} \
      <div> \
    {{else}} \
      <div class="infobox-map"> \
    {{/if}} \
    <div class="entity blue_box {{row.Grantee_Organization_Type_Description}}"><span id="entity-text">.gov</span></div> \
    <div class="entity red_box {{row.Grantee_Organization_Type_Description}}"><span id="entity-text">.com</span></div> \
    <div class="entity orange_box {{row.Grantee_Organization_Type_Description}}"><span id="entity-text">.org</span></div> \
    <h4 class="infobox-header">{{row.Name}}</h4> \
    {{#if isListView}} \
      <p class="ui-li-desc infobox-subheader"> \
      {{row.Grantee_Organization_Type_Description}}<br> \
      {{row.Address}}</p> \
    {{else}} \
      <p></p><p class="ui-li-desc"> \
      {{row.Grantee_Organization_Type_Description}}<br> \
      {{row.Address}}<br> \
      {{#if row.URL}} \
        <a href="{{row.URL}}" target="_blank">{{row.URL}}</a><br> \
      {{/if}} \
      <a href="tel:1{{row.Telephone_Number}}">{{row.Telephone_Number}}</a></p> \
    {{/if}} \
    </p></div>',
          
  // Infoboxes will also appear (unless blank) on your nearby or search address pins.
  // HTML is OK.  Use "{address}" to denote the entered address for addressPinInfobox.
  nearbyPinInfobox: "You are here.",
  addressPinInfobox: "{address}",


  ////////////////////////
  // 4. MAP PREFERENCES //
  ////////////////////////

  // Override the location column in your Fusion Table (useful if you have multiple columns)
  // NOTE: if you have "latitude" and "longitude" columns, just use "latitude"
  //locationColumn:     "Address",
  
  // Bounds and center that your map defaults to when location services are off.
  // If useDefaultMapBounds is true (see section 2), this also determines which addresses get priority with autocomplete
  defaultMapBounds: {

    // Use [latitude, longitude] or address
    center: "United States",

    // "X miles" or "X meters"
    radius: "1500 miles"
  },

  // Set useNearbyLocation to false if you don't want to get the user's location.
  useNearbyLocation: {
    startAtNearbyLocation:      true,

    // If true: use nearby location only if we're within default map bounds
    //          otherwise, post boundsExceededMessage (if non-empty) and use mapDefaultCenter.
    onlyWithinDefaultMapBounds: true,
    boundsExceededMessage:  "You're currently outside the continental United States.  Defaulting to geographical center.",

    // use this zoom radius if starting at nearby location
    nearbyZoomRadius:           "32 miles",

    // Snap to nearby zoom radius when user hits "Nearby"?  Options are:
    // true             = always snap to zoom level
    // false (default)  = never snap to zoom level
    // int              = snap to zoom level if ratio between current and nearby zoom radii
    //                      is greater than this (in either direction)
    snapToNearbyZoomIfRatioGreaterThan: 8
  }

});
