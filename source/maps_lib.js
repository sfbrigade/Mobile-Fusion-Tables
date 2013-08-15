/*!
 * Mobile version of Derek Eder's searchable map template
 * with Google Fusion Tables
 * http://derekeder.com/searchable_map_template/
 *
 * Copyright 2012, Derek Eder
 * Licensed under the MIT license.
 * https://github.com/derekeder/FusionTable-Map-Template/wiki/License
 *
 * Date: 12/10/2012
 *
 * To Customize, replace the values and implementations between the
 * "CUSTOM DATA AND CODE" markers.  It's all in one chunk below.
 *
 */

var MapsLib = MapsLib || {};
var MapsLib = {

  ////////////////////////////////
  // BEGIN CUSTOM DATA AND CODE //
  ////////////////////////////////

  // top title (including title of website)
  title: "Inspection Data",

  //center that your map defaults to
  map_default_center: new google.maps.LatLng(37.77, -122.45), 

  //-- BEGIN Fusion Table details (using v1 Fusion Tables API) --//
  //See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //the encrypted Table ID of your Fusion Table (found under File => About)
  fusionTableId:      "1kjZeEXWdu2NmsWKFnMoqek4f0EV-dVIJjxMHg6w",

  //*New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyAMVBSXes-6P-gWaxRj20GK8NT6WDVpozM",

  //name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  locationColumn:     "latitude",

  //-- END Fusion Table details --//


  //-- BEGIN Custom Infobox template --//

  // Handlebars template using the following variables:
  //  - row.COLUMN_NAME, returns value for given column in your FusionTable row
  //  - isListView, which evaluates to:
  //      - false when populating a map infobox
  //      - true when populating an entry in "List" view
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

  //-- END Custom Infobox template --//


  // Search Settings:
  // By default, you will get a text field for each column.
  // However, you can customize search settings using the following attributes:
  //  - allColumns (default=true):            a text field will appear for each column.
  //  - allColumnsExactMatch (default=false): allColumns + exact matching of fields.
  //  - addressDistances:                     array of drop-down options for distance from address
  //     Format for each entry is [float: zoom*, string: label for drop-down, true if default selection]
  //     If you don't set this, then it won't have an address search field.
  //  - dropDowns: array of custom drop-downs, where an entry has the following attributes:
  //       - label
  //       - options (drop-down options where an option is [label, Fusion Table SQL-style WHERE clause, true if default selection])
  //  - columns: array of column fields, where a field has the following attributes:
  //       - label
  //       - column: name of column
  //       - exact_match (default=false, meaningless if options is specified): look for exact match instead of a contains match
  //  If "allColumns" is true, "columns" will simply override label/match settings for the specified columns
  // * Fusion Table's "zoom" values, where X-1 covers twice the radius of X.  14 = radius of 1 mile on typical mobile device

  searchSettings: { 
    allColumns: false,
    addressDistances: [ [16, "2 blocks", true], [15, "1/2 mile"], [14, "1 mile"], [13, "2 miles"] ],
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

  //-- BEGIN Search customizations --//
  locationScope:      "San Francisco, CA",      //format: [City,] STATE.  (can be null/empty)  geographical area for all address searches
  recordName:         "result",       //for showing number of results
  recordNamePlural:   "results",

  //-- END Search customizations --//


  //-- BEGIN Launch/Zoom behavior --//
  maxRadius:          1610 * 5,       // -1: always start at current location
                                      //  0: always start at map_default_center
                                      // >0: start at map_default_center if we're more than maxRadius away
                                      //     sends alert with maxRadiusExceededMessage (unless it's empty) 
  maxRadiusExceededMessage: "Your location is far away from San Francisco.  Defaulting to city limits.",

  defaultZoom:        11,             //zoom level when map is loaded (bigger is more zoomed in)
  nearbyZoom:         17,             //zoom level when using nearby location

  //-- END Launch/Zoom behavior --//

  customInit: function () {
    // add custom initialization code here
  },

  //////////////////////////////
  // END CUSTOM DATA AND CODE //
  //////////////////////////////
  map_centroid:       null, // gets initialized below
  num_list_rows:      0, 
  in_query:           false, 
  addrMarkerImage:    '//maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png',
  blueDotImage:       '//maps.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',
  currentPinpoint:    null,
  infoWindow:         new google.maps.InfoWindow({}),
  nearbyPosition:     null,
  overrideCenter:     false, 
  ignoreResize:       false,
  infoboxCompiled:    null,
  columns:            [],
  searchRadius:       11, // in zoom units
  customSearchFilter: "",

  initialize: function() {
    MapsLib.searchRadius = MapsLib.defaultZoom;
    MapsLib.getColumns("MapsLib.setColumns");
    MapsLib.infoboxCompiled = Handlebars.compile(MapsLib.infoboxTemplate);
    document.title = MapsLib.title;
    $("#titlebar").text(MapsLib.title);
    MapsLib.map_centroid = MapsLib.map_default_center;

    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      streetViewControl: false,
      panControl: false,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // hide map until we get current location (to avoid snapping)
    $("#map_canvas").css("visibility","hidden"); 
    map = new google.maps.Map($("#map_canvas")[0],myOptions);
    
    // add to list view when user scrolls to the bottom
    $(window).scroll(function() {
       if (MapsLib.num_list_rows == 0) return;

       var listHeight = $("#page-list").height();
       if (MapsLib.num_list_rows == 10)
       {
          // HACK: the page-list height isn't properly updated the first time, so
          // hard-code 10 * max-height of cell
          listHeight = 800;
       }
       //console.log($(window).scrollTop(), $(window).height(), listHeight );
       if(!MapsLib.in_query && $(window).scrollTop() + $(window).height() >= listHeight - 100) {
           MapsLib.updateListView();
       }
    });

    updateCenter = function(userPosition) {
      var useNearbyPosition = true;

      // don't follow user if maxRadius is 0
      if (MapsLib.maxRadius == 0)
      {
        useNearbyPosition = false;
      }
      else
      { 
        MapsLib.nearbyPosition = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
        if (MapsLib.maxRadius > 0)
        {
          // check our distance from the default center
          var dist = google.maps.geometry.spherical.computeDistanceBetween(MapsLib.nearbyPosition, MapsLib.map_default_center);
          if (dist > MapsLib.maxRadius)
          {
            useNearbyPosition = false;
            if (MapsLib.maxRadiusExceededMessage && MapsLib.maxRadiusExceededMessage.length > 0)
            {
              $( "#maxRadiusExceededMessageText" ).text(MapsLib.maxRadiusExceededMessage);
              $( "#popupDialog" ).popup( "open" );
            }
          }
        }
      }
      map.setCenter(useNearbyPosition ? MapsLib.nearbyPosition : MapsLib.map_default_center);
      map.setZoom(useNearbyPosition ? MapsLib.nearbyZoom : MapsLib.defaultZoom);
      MapsLib.map_centroid = useNearbyPosition ? MapsLib.nearbyPosition : MapsLib.map_default_center;
      if (useNearbyPosition)
      {
        if (MapsLib.localMarker != null)
        {
          MapsLib.localMarker.setMap(null);
        }
        MapsLib.localMarker = new google.maps.Marker({
          position: MapsLib.nearbyPosition,
          map: map,
          icon: MapsLib.blueDotImage,
          animation: google.maps.Animation.DROP,
          title:"You are here."
        });
        google.maps.event.addListener(MapsLib.localMarker, 'click', function() {
            MapsLib.infoWindow.setContent('<div id="infobox-container">You are here.</div>');
            MapsLib.infoWindow.open(map, this);
        }); 
      }
    }

    function locationError(err) {
      // TODO: this alert messes up the pin display on Android emulator.
      //   If this is not a problem on an actual Android, uncomment alert.
      //alert("Timed out getting current position.");
    };

    getlocation = function(){
        if (navigator.geolocation) {
          var options = {
            timeout: 5000
          };
          navigator.geolocation.getCurrentPosition(updateCenter, locationError, options);
        } else {
          alert("Your device is not sharing its location.");
        }
        return false;
    }
    getlocation();
    $("#map_canvas").css("visibility","visible"); 

    // Wire up event handler for nearby button.
    $("a#nearby").click(function(e) {
        //e.stopImmediatePropagation();
        //e.preventDefault();
        MapsLib.addrMarker.setVisible(false);
        getlocation();
        setTimeout("$('a#nearby').removeClass('ui-btn-active')", 500);
    }
    );

    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        if (!MapsLib.overrideCenter)
        {
          MapsLib.map_centroid = map.getCenter();
        }
        google.maps.event.trigger(map, 'resize'); // resolves map redraw issue on mobile devices
        map.setCenter(MapsLib.map_centroid);
        MapsLib.overrideCenter = false;
        MapsLib.ignoreResize = false;
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        if (!MapsLib.ignoreResize)
        {
          map.setCenter(MapsLib.map_centroid);
        }
    });

    MapsLib.searchrecords = null;

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
    if (loadRadius != "") $("#search_radius").val(loadRadius);
    else $("#search_radius").val(MapsLib.searchRadius);
    $(":checkbox").attr("checked", "checked");

    //-----custom initializers-------
    MapsLib.customInit();
    //-----end of custom initializers-------
  },

  // Creates HTML content for search page given searchSettings
  // See commentary above searchSettings definition for data layout
  searchHtml: function() {
    var html = [];
    var settings = MapsLib.searchSettings;
    var addressSearched = ("addressDistances" in settings);
    if (addressSearched)
    {
        html = [
          "<label for='search_address'>Address / Intersection:</label>",
          "<input class='input-block-level' id='search_address' placeholder='defaults to current location' type='text' />",
          "<hr><label for='search_radius'>Within:</label>",
          "<select class='input-small' id='search_radius'>"];
        var distances = settings.addressDistances;
        for (var i=0; i<distances.length; i++)
        {
          var distEntry = distances[i]; // format: [zoom, label, true if selected]
          var selected = (distEntry.length > 2 && distEntry[2] == true) ? " selected='selected'" : "";
          html.push("<option value='" + distEntry[0] + "'" + selected + ">" + distEntry[1] + "</option>");
        }
        html.push("</select>");
    }

    var dropdowns = ("dropDowns" in settings) ? settings.dropDowns : [];
    for (var i=0; i<dropdowns.length; i++)
    {
      var field = dropdowns[i];
      var field_id = field.label.replace(" ","_");
      html.push("<hr><label for='sc_" + field_id + "'>" + field.label + ":</label>");
      html.push("<select data-ref='custom' id='sc_" + field_id + "' name=''>");
      var options = field.options;
      for (var j=0; j<options.length; j++)
      {
        var option = options[j];
        var selected = (option.length > 2 && option[2] == true) ? " selected='selected'" : "";
        html.push('<option value="' + option[1] + '"' + selected + ">" + option[0] + "</option>");
      }
      html.push("</select>");
    }

    var exactMatchAll = ("allColumnsExactMatch" in settings);
    var columns = ("columns" in settings) ? settings.columns : [];

    if (exactMatchAll || !("allColumns" in settings && settings.allColumns == false))
    {
      var customColumns = [];
      for (var i=0; i<columns.length; i++)
      {
        customColumns.push(columns[i].column);
      }
      columns = []; // custom columns will get reinserted in column order
      for (var i=0; i<MapsLib.columns.length; i++)
      {
        var columnName = MapsLib.columns[i];
        if ($.inArray(columnName, ["latitude","longitude"]) >= 0) continue;
        // skip address field if addressSearched is true
        if (addressSearched && $.inArray(columnName, ["address","city","state","postal_code"]) >= 0) continue;
        var cIndex = $.inArray(columnName, customColumns);
        if (cIndex >= 0)
        {
          columns.push(settings.columns[cIndex]);
        }
        else
        {
          columns.push({column:columnName, label:columnName, exact_match:exactMatchAll});
        }
      }
    }

    for (var i=0; i<columns.length; i++)
    {
      var field = columns[i];
      var placeholder = field.exact_match ? "Exact match (case-sensitive)" : "Match anything containing this text";
      html.push("<hr><label for='sc_" + field.column + "'>" + field.label + ":</label>");
      html.push("<input class='input-block-level' data-ref='column' data-field='" + 
        field.column + "' data-exact='" + field.exact_match + "' id='sc_" + field.column + "' placeholder='" + 
        placeholder + "' type='text' />");
    }
    return html.join("");
  },

  // Generates search query according to generated HTML for Search section
  doSearch: function(hideRadius) {
    MapsLib.clearSearch();

    //-----custom filters-------
    var address = $("#search_address").val();
    MapsLib.searchRadius = $("#search_radius").val()*1;
    // HACK: search radius was calibrated for min(width,height)=320, so we offset the zoom accordingly
    var min_diameter = Math.min($(document).width(),$(document).height());
    var zoomOffset = Math.round(Math.log(min_diameter/320)/Math.LN2);

    var whereClauses = [];
    $("input[data-ref='column']").each(function( index ) { 
        var value = $(this).val();
        if (typeof value != 'undefined' && value.length > 0)
        { 
          value = value.replace("'","''"); // escape single quotes for SQL query
          var column = $(this).attr("data-field");
          if ($(this).attr("data-exact") == 'true')
          {
            whereClauses.push(column + " = '" + value + "'");
          }
          else
          {
            whereClauses.push(column + " CONTAINS IGNORING CASE '" + value + "'");
          }
        }
    });

    $("select[data-ref='custom']").each(function( index ) { 
      whereClauses.push($(this).find(":selected").val());
    });

    MapsLib.customSearchFilter = whereClauses.join(" AND ");
    var whereClause = MapsLib.locationColumn + " not equal to ''";
    if (MapsLib.customSearchFilter.length > 0)
    {
      whereClause += " AND " + MapsLib.customSearchFilter;
    }
    //-------end of custom filters--------

    if (address != "" && address != undefined) {
        // search w/ specified address
        if (MapsLib.locationScope != null && MapsLib.locationScope.replace(" ","") != "")
        {
          // append or replace tail of address with location scope (using commas as scope boundaries)
          var numCommas = (address.split(",").length - MapsLib.locationScope.split(",").length);
          var index = null, comma = 0;
          while (comma < numCommas && index != -1) {
              index = address.indexOf(",", index+1);
              comma++;
          }
          if (index == null) index = address.length;
          address = address.substring(0,index) + ", " + MapsLib.locationScope;
          $("#search_address").val(address);
        }

        geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          // -------- issues -------
          // Below source code sets in query strings for the search; Temporarily commented this out as it causes page load error; The query string is used for parsing out search parameters, please see method "convertToPlainString"
          // $.address.parameter('address', encodeURIComponent(address));
          // $.address.parameter('radius', encodeURIComponent(MapsLib.searchRadius));

          map.setCenter(MapsLib.currentPinpoint);
          MapsLib.map_centroid = MapsLib.currentPinpoint;
          map.setZoom(MapsLib.searchRadius+zoomOffset-1);

          MapsLib.localMarker.setVisible(false);
          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });

          // Map now refocuses instead of filtering by search location
          // whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

          MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
          MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else if (MapsLib.searchRadius > 0 && (typeof hideRadius == 'undefined' || hideRadius == false))
    {
      // search w/ current location
      if (typeof MapsLib.localMarker != 'undefined')
      {
        MapsLib.localMarker.setVisible(true);
      }
      if (typeof MapsLib.addrMarker != 'undefined')
      {
        MapsLib.addrMarker.setVisible(false);
      }
      map.setCenter(MapsLib.nearbyPosition);
      MapsLib.map_centroid = MapsLib.nearbyPosition;
      map.setZoom(MapsLib.searchRadius+zoomOffset-1);

      MapsLib.drawSearchRadiusCircle(MapsLib.nearbyPosition);
      MapsLib.submitSearch(whereClause, map, MapsLib.nearbyPosition);
    }
    else
    {
      // non-user search or address fields disabled
      MapsLib.submitSearch(whereClause, map);
    }
  },

  infoboxHTMLHelper: function(row, isListView) {
    if (typeof isListView == 'undefined') isListView = false;

    var extracted_row = {}
    for (key in row)
    {
      extracted_row[key] = row[key].value;
    }

    return MapsLib.infoboxCompiled({isListView: isListView ? "true" : "", row: extracted_row});
  },

  submitSearch: function(whereClause, map, location) {
    //get using all filters
    //NOTE: styleId and templateId are recently added attributes to load custom marker styles and info windows
    //you can find your Ids inside the link generated by the 'Publish' option in Fusion Tables
    //for more details, see https://developers.google.com/fusiontables/docs/v1/using#WorkingStyles

    MapsLib.searchrecords = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.fusionTableId,
        select: MapsLib.locationColumn,
        where:  whereClause
      },
      styleId: 2,
      templateId: 3,
      suppressInfoWindows: true
    });
    google.maps.event.clearListeners(MapsLib.searchrecords, 'click');
    google.maps.event.addListener(MapsLib.searchrecords, 'click', function(e) {
        if (typeof(MapsLib.infoboxHTMLHelper) != 'undefined')
        {
            // NOTE: Google's InfoWindow API currently provides no way to shorten the tail,
            // which is problematic when viewing on a mobile device in landscape mode

            MapsLib.infoWindow.setOptions({
              content: MapsLib.infoboxHTMLHelper((typeof e == 'undefined') ? {} : e.row),
              position: e.latLng,
              pixelOffset: e.pixelOffset
            });
            MapsLib.infoWindow.open(map);
        }
    });
    MapsLib.searchrecords.setMap(map);
    MapsLib.overrideCenter = true;
  },

  clearSearch: function() {
    if (MapsLib.searchrecords != null)
      MapsLib.searchrecords.setMap(null);
    if (MapsLib.addrMarker != null)
      MapsLib.addrMarker.setMap(null);
    if (MapsLib.searchRadiusCircle != null)
      MapsLib.searchRadiusCircle.setMap(null);
    MapsLib.infoWindow.close();
    MapsLib.customSearchFilter = "";
  },

  drawSearchRadiusCircle: function(point) {
      var radiusMeters = (100 * Math.pow(2, (18-MapsLib.searchRadius)));
      var circleOptions = {
        strokeColor: "#4b58a6",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#4b58a6",
        fillOpacity: 0.05,
        map: map,
        center: point,
        clickable: false,
        zIndex: -1,
        radius: radiusMeters
      };
      MapsLib.searchRadiusCircle = new google.maps.Circle(circleOptions);
  },

  getColumns: function(callback) {
    var qstr = "https://www.googleapis.com/fusiontables/v1/tables/" + MapsLib.fusionTableId + "/columns?callback="+callback + "&key=" + MapsLib.googleApiKey;
    $.ajax({url: qstr, dataType: "jsonp"});
  },

  query: function(selectColumns, whereClause, orderClause, callback) {
    var queryStr = [];
    queryStr.push("SELECT " + selectColumns);
    queryStr.push(" FROM " + MapsLib.fusionTableId);
    if (whereClause) {
        queryStr.push(" WHERE " + whereClause);
    }
    if (orderClause) {
        queryStr.push(" ORDER BY " + orderClause);
    }

    var sql = encodeURIComponent(queryStr.join(" "));
    var qstr = "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+MapsLib.googleApiKey;
    console.log("Query: " + qstr);
    $.ajax({url: qstr, dataType: "jsonp"});
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
      }
      return true;
    }
  },

  setColumns: function(json) {
    if (MapsLib.handleError(json)) {
        return false;
    }
    var all_columns = [];
    var num_columns = json["items"].length;
    for (var i = 0; i < num_columns; i++)
    {
      all_columns.push(json["items"][i]["name"]);
    }
    MapsLib.columns = all_columns;
    $("#section-search").html(MapsLib.searchHtml());
    $("#search_address").geocomplete({country: 'us'});
    MapsLib.doSearch(true);
  },

  getListView: function() {
      MapsLib.num_list_rows = 0;
      MapsLib.updateListView();
  },

  updateListView: function() {
      var whereClause = MapsLib.locationColumn + " not equal to ''";
      if (MapsLib.customSearchFilter.length > 0) {
        whereClause += " AND " + MapsLib.customSearchFilter;
      }

      // HACK: all we really want is the 10 rows that come after the existing MapsLib.num_list_rows.
      //  but now we're querying all the rows up to it.  Is there a way to just get rows x to x+10? 
      var orderClause = "ST_DISTANCE(latitude, LATLNG(" + map.getCenter().lat() + "," + 
                map.getCenter().lng() + ")) LIMIT " + (MapsLib.num_list_rows + 10);
      if (MapsLib.num_list_rows == 0)
      {
        $("ul#listview").html('<li data-corners="false" data-shadow="false" data-iconshadow="true" data-theme="d">Loading results...</li>');
      }
      MapsLib.in_query = true;
      MapsLib.query("*", whereClause, orderClause, "MapsLib.displayListView");
  },

  displayListView: function(json) {
      MapsLib.in_query = false;
      if (MapsLib.handleError(json)) {
          return false;
      }
      // Empty the listview object.
      var existingRows = MapsLib.num_list_rows;
      if (existingRows == 0)
      {
        $("ul#listview").html("");
      }

      var numRows = json.rows.length;
      // we already have the first existingRows, we're just appending the remainder
      for (var ix=existingRows; ix<numRows; ix++){
          // make row object.
          var row = {};
          for (var jx=0; jx<json.columns.length; jx++) {
              row[ json.columns[jx] ] = {"value" : json.rows[ix][jx]};
          }

          var row_html = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="d" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-up-d"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a href="todo.html" data-transition="slidedown" class="ui-link-inherit">';
          row_html += MapsLib.infoboxHTMLHelper(row, true);
          row_html += '</a></div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span></div></li>';

          $("ul#listview").append(row_html);
      }
      MapsLib.num_list_rows += numRows;
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
    return decodeURIComponent(text);
  }

  //-----custom functions------------------------------------------------------
  // NOTE: if you add custom functions, make sure to append each one with a 
  // comma, except for the last one.
  // This also applies to the convertToPlainString function above
  //-----end of custom functions-----------------------------------------------
}
