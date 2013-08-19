/*!
 * To customize this page for your own data, open fusiontable_settings.js and follow instructions.
 * You should not have to touch this file.
 *
 * Mobile version of Derek Eder's searchable map template with Google Fusion Tables
 * https://github.com/sfbrigade/FusionTable-Map-MobileTemplate
 *
 * Original map template Copyright 2012, Derek Eder
 * Licensed under the MIT license.
 * https://github.com/derekeder/FusionTable-Map-Template/wiki/License
 */

var MapsLib = MapsLib || {};
$.extend(MapsLib, {
  // map and positions
  map:                null, // gets initialized below
  map_centroid:       MapsLib.mapDefaultCenter,
  maxDistanceFromDefaultCenter: 0,
  nearbyZoomThreshold:-1,
  searchRadiusCircle: null,
  nearbyPosition:     null,
  overrideCenter:     false, 
  ignoreIdle:         false,

  // markers
  addrMarker:         null,
  localMarker:        null,
  addrMarkerImage:    '//maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png',
  blueDotImage:       '//maps.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',
  currentPinpoint:    null,

  // infoboxes
  infoWindow:         new google.maps.InfoWindow({}),
  infoboxCompiled:    null,
  queueInfobox:       false,


  // search and list
  searchPage:         MapsLib.searchPage || {},
  columns:            [],
  in_query:           false, 
  searchRadius:       0,
  customSearchFilter: "",
  listViewRows:       [],
  selectedListRow:    null,

  stringExists: function(teststr) {
    return (typeof teststr != 'undefined' && teststr != null && teststr.length > 0);
  },

  initialize: function() {
    if (MapsLib.stringExists(MapsLib.customCSS))
    {
      var css = document.createElement("style");
      css.type = "text/css";
      css.innerHTML = MapsLib.customCSS;
      document.head.appendChild(css);
    }

    // fill in defaults for searchPage settings
    var searchPageDefaults = { allColumns: true, allColumnsExactMatch: false, searchByAddress: true,
      distanceFilter: {}, dropDowns: [], columns: [] };
    var distanceFilterDefaults = { filterSearchResults: true, filterListResults: true, dropDown: [] };
    for (key in searchPageDefaults)
    {
      if (!(key in MapsLib.searchPage)) MapsLib.searchPage[key] = searchPageDefaults[key];
    }
    for (key in distanceFilterDefaults)
    {
      if (!(key in MapsLib.searchPage.distanceFilter)) MapsLib.searchPage.distanceFilter[key] = distanceFilterDefaults[key];
    }

    if (!("useNearbyLocation" in MapsLib))
    {
      MapsLib.useNearbyLocation = false;
      MapsLib.maxDistanceFromDefaultCenter = 0;
      $("#nearby-name").text("Home");
    }
    else 
    {
      MapsLib.nearbyZoomThreshold = MapsLib.useNearbyLocation.snapToNearbyZoom;
      if (MapsLib.nearbyZoomThreshold == true) MapsLib.nearbyZoomThreshold = 0;

      if (!("onlyIfWithin" in MapsLib.useNearbyLocation))
      {
        // always use default location
        MapsLib.maxDistanceFromDefaultCenter = -1;
      }
      else
      {
        var tokens = MapsLib.useNearbyLocation.onlyIfWithin.toLowerCase().split(" ");
        MapsLib.maxDistanceFromDefaultCenter = tokens[0]*1;
        if (tokens[1] == "miles" || tokens[1] == "mile")
        {
          MapsLib.maxDistanceFromDefaultCenter *= 1610;
        }
      }
    }
    MapsLib.getColumns("MapsLib.setColumns");
    if (MapsLib.stringExists(MapsLib.infoboxTemplate))
    {
      MapsLib.infoboxCompiled = Handlebars.compile(MapsLib.infoboxTemplate);
    }
    document.title = MapsLib.title;
    $("#titlebar").text(MapsLib.title);
    $("#section-about").html(MapsLib.aboutPage);

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
    MapsLib.map = new google.maps.Map($("#map_canvas")[0],myOptions);
    if (MapsLib.useNearbyLocation && "nearbyZoom" in MapsLib.useNearbyLocation)
    {
      MapsLib.map.setZoom(MapsLib.useNearbyLocation.nearbyZoom);
    }
    
    // add to list view when user scrolls to the bottom
    $(window).scroll(function() {
       if (MapsLib.listViewRows.length == 0) return;

       var listHeight = $("#page-list").height();
       if (MapsLib.listViewRows.length == 10)
       {
          // HACK: the page-list height isn't properly updated the first time, so
          // hard-code 10 * max-height of cell
          listHeight = 800;
       }
       if(!MapsLib.in_query && $(window).scrollTop() + $(window).height() >= listHeight - 100) {
           MapsLib.updateListView();
       }
    });

    updateCenter = function(userPosition) {
      var useNearbyPosition = true;

      // don't follow user if maxDistanceFromDefaultCenter is 0
      if (!MapsLib.useNearbyLocation || userPosition == null)
      {
        useNearbyPosition = false;
      }
      else
      { 
        MapsLib.nearbyPosition = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
        if (MapsLib.maxDistanceFromDefaultCenter > 0)
        {
          // check our distance from the default center
          var dist = google.maps.geometry.spherical.computeDistanceBetween(MapsLib.nearbyPosition, MapsLib.mapDefaultCenter);
          if (dist > MapsLib.maxDistanceFromDefaultCenter)
          {
            useNearbyPosition = false;
            if (MapsLib.stringExists(MapsLib.useNearbyLocation.boundsExceededMessage))
            {
              $( "#boundsExceededMessageText" ).text(MapsLib.useNearbyLocation.boundsExceededMessage);
              $( "#popupDialog" ).popup( "open" );
            }
          }
        }
      }
      if (!useNearbyPosition)
      {
        MapsLib.currentPinpoint = MapsLib.mapDefaultCenter;
        MapsLib.nearbyPosition = MapsLib.mapDefaultCenter;
        MapsLib.map.setCenter(MapsLib.nearbyPosition);
        MapsLib.map.setZoom(MapsLib.defaultZoom);
        MapsLib.map_centroid = MapsLib.nearbyPosition;
      }
      else
      {
        MapsLib.currentPinpoint = MapsLib.nearbyPosition;
        MapsLib.map.setCenter(MapsLib.nearbyPosition);
        MapsLib.map_centroid = MapsLib.nearbyPosition;
        if (MapsLib.localMarker != null)
        {
          MapsLib.localMarker.setMap(null);
        }
        MapsLib.localMarker = new google.maps.Marker({
          position: MapsLib.nearbyPosition,
          map: MapsLib.map,
          icon: MapsLib.blueDotImage,
          animation: google.maps.Animation.DROP,
          title:"You are here."
        });
        if (MapsLib.stringExists(MapsLib.nearbyPinInfobox))
        {
          google.maps.event.addListener(MapsLib.localMarker, 'click', function() {
            MapsLib.infoWindow.setOptions({
              content: '<div class="infobox-container">' + MapsLib.nearbyPinInfobox + '</div>',
              position: MapsLib.nearbyPosition,
              pixelOffset: new google.maps.Size(0,-32)
            });
            MapsLib.infoWindow.open(MapsLib.map);
          }); 
        }
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
    if (MapsLib.useNearbyLocation && MapsLib.useNearbyLocation.startAtNearbyLocation)
    {
      getlocation();
    }
    else
    {
      updateCenter(null);
    }
    $("#map_canvas").css("visibility","visible"); 

    // Wire up event handler for nearby button.
    $("a#nearby").click(function(e) {
        //e.stopImmediatePropagation();
        //e.preventDefault();
        MapsLib.safeShow(MapsLib.addrMarker, false);
        if (MapsLib.useNearbyLocation)
        {
          getlocation();
        }
        else
        {
          updateCenter();
        }
        var settings = MapsLib.useNearbyLocation;
        if (MapsLib.nearbyZoomThreshold != -1 && (Math.abs(MapsLib.map.getZoom() - settings.nearbyZoom) >= MapsLib.nearbyZoomThreshold))
        {
          MapsLib.map.setZoom(settings.nearbyZoom);
        }
        setTimeout("$('a#nearby').removeClass('ui-btn-active');", 500);
      }
    );

    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(MapsLib.map, 'idle', function() {
      if (!MapsLib.ignoreIdle)
      {
        if (!MapsLib.overrideCenter)
        {
          MapsLib.map_centroid = MapsLib.map.getCenter();
        }
        MapsLib.map.setCenter(MapsLib.map_centroid);
        MapsLib.overrideCenter = false;
      }
    });

    google.maps.event.addDomListener(window, 'resize', function() {
      if (!MapsLib.ignoreIdle)
      {
        MapsLib.map.setCenter(MapsLib.map_centroid);
        MapsLib.overrideCenter = true;
      }
    });

    MapsLib.searchrecords = null;

    //-----custom initializers-------
    //-----end of custom initializers-------
  },

  // RECURSIVE HACK: There's a race condition between Google Maps and JQuery Mobile
  // So the following code resolves map redraw and centering issues on mobile devices
  reCenterWhenReady: function() {
    if ($("#map_canvas").width() == 0 || $("#map_canvas").height() == 0)
    {
      // window still size 0, keep waiting
      setTimeout("MapsLib.reCenterWhenReady()", 500);
    }
    else 
    {
      MapsLib.ignoreIdle = false;
      google.maps.event.trigger(MapsLib.map, 'resize');

      if (MapsLib.queueInfobox)
      {
        MapsLib.queueInfobox = false;
        MapsLib.map_centroid = MapsLib.infoWindow.location;
        MapsLib.map.setCenter(MapsLib.map_centroid);
        MapsLib.infoWindow.open(MapsLib.map);
      }
      else
      {    
        // returning from list view sometimes triggers an additional idle call before map.getCenter() is ready
        MapsLib.overrideCenter = true;
        setTimeout("MapsLib.overrideCenter = false", 500);
      }
    }
  },

  // Creates HTML content for search page given searchPage settings
  // See commentary above searchPage definition (in settings file) for data layout
  searchHtml: function() {
    var html = [];
    var settings = MapsLib.searchPage;
    if (settings.searchByAddress)
    {
      html.push("<label for='search_address'>Address / Intersection:</label>");
      html.push("<input class='input-block-level' data-clear-btn='true' id='search_address' placeholder='defaults to current center' type='text' />");
    }
    if (settings.distanceFilter.dropDown.length > 0)
    {
      html.push("<hr><label for='search_radius'>Within:</label>");
      html.push("<select class='input-small' id='search_radius'>");
      var distances = settings.distanceFilter.dropDown;
      for (var i=0; i<distances.length; i++)
      {
        var distEntry = distances[i]; // format: [zoom, label, true if selected]
        var selected = (distEntry.length > 2 && distEntry[2] == true) ? " selected='selected'" : "";
        html.push("<option value='" + distEntry[0] + "'" + selected + ">" + distEntry[1] + "</option>");
      }
      html.push("</select>");
    }

    for (var i=0; i<settings.dropDowns.length; i++)
    {
      var field = settings.dropDowns[i];
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

    var columns = settings.columns;
    if (settings.allColumns || settings.allColumnsExactMatch)
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
        if (MapsLib.searchPage.searchByAddress && $.inArray(columnName, ["address","city","state","postal_code"]) >= 0) continue;
        var cIndex = $.inArray(columnName, customColumns);
        if (cIndex >= 0)
        {
          columns.push(settings.columns[cIndex]);
        }
        else
        {
          columns.push({column:columnName, label:columnName, exact_match:settings.allColumnsExactMatch});
        }
      }
    }

    for (var i=0; i<columns.length; i++)
    {
      var field = columns[i];
      var placeholder = field.exact_match ? "Exact match (case-sensitive)" : "Match anything containing this text";
      html.push("<hr><label for='sc_" + field.column + "'>" + field.label + ":</label>");
      html.push("<input class='input-block-level' data-clear-btn='true' data-ref='column' data-field='" + 
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
    MapsLib.searchRadius = (hideRadius == true) ? 0 : $("#search_radius").val()*1;
    // HACK: search radius was calibrated for min(width,height)=320, so we offset the zoom accordingly
    var min_diameter = Math.min($(document).width(),$(document).height());
    var zoomOffset = Math.round(Math.log(min_diameter/320)/Math.LN2);

    var whereClauses = [];
    $("input[data-ref='column']").each(function( index ) { 
        var value = $(this).val();
        if (MapsLib.stringExists(value))
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
        var shortAddress = address;
        if (MapsLib.addressScope != null && MapsLib.addressScope.replace(" ","") != "")
        {
          // append or replace tail of address with location scope (using commas as scope boundaries)
          var numCommas = (address.split(",").length - MapsLib.addressScope.split(",").length);
          var index = null, comma = 0;
          while (comma < numCommas && index != -1) {
              index = address.indexOf(",", index+1);
              comma++;
          }
          if (index == null) index = address.length;
          shortAddress = address.substring(0,index);
          address = shortAddress + ", " + MapsLib.addressScope;
          $("#search_address").val(address);
        }

        geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          MapsLib.map.setCenter(MapsLib.currentPinpoint);
          MapsLib.map_centroid = MapsLib.currentPinpoint;
          if (MapsLib.searchRadius > 0)
          {
            MapsLib.map.setZoom(MapsLib.searchRadius+zoomOffset-1);
          }

          MapsLib.safeShow(MapsLib.localMarker, false);
          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: MapsLib.map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });

          if (MapsLib.stringExists(MapsLib.addressPinInfobox))
          {
            google.maps.event.addListener(MapsLib.addrMarker, 'click', function() {
              MapsLib.infoWindow.setOptions({
                content: '<div class="infobox-container">' + MapsLib.addressPinInfobox.replace("{address}",shortAddress) + '</div>',
                position: MapsLib.currentPinpoint,
                pixelOffset: new google.maps.Size(0,-32)
              });
              MapsLib.infoWindow.open(MapsLib.map);
            }); 
          }
          if (MapsLib.searchPage.distanceFilter.filterSearchResults && MapsLib.searchRadius > 0)
          {
            whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadiusMeters() + "))";
            MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
          }
          MapsLib.submitSearch(whereClause, MapsLib.map, MapsLib.currentPinpoint);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else if ((MapsLib.searchPage.distanceFilter.dropDown.length > 0 || MapsLib.searchPage.searchByAddress) && (typeof hideRadius == 'undefined' || hideRadius == false))
    {
      // search w/ current location
      MapsLib.currentPinpoint = MapsLib.map_centroid;
      MapsLib.safeShow(MapsLib.localMarker, true);
      MapsLib.safeShow(MapsLib.addrMarker, false);
      if (MapsLib.searchRadius > 0)
      {
        if (MapsLib.searchPage.distanceFilter.filterSearchResults)
        {
          whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.map_centroid.toString() + "," + MapsLib.searchRadiusMeters() + "))";
        }
        MapsLib.map.setZoom(MapsLib.searchRadius+zoomOffset-1);
        MapsLib.drawSearchRadiusCircle(MapsLib.map_centroid);
      }
      MapsLib.submitSearch(whereClause, MapsLib.map, MapsLib.map_centroid);
    }
    else
    {
      // non-user search or address fields disabled
      MapsLib.submitSearch(whereClause, MapsLib.map);
    }
  },

  safeShow: function(testobj, visible) {
    if (testobj != null)
    {
      testobj.setVisible(visible);
    }
  },

  infoboxHTMLHelper: function(row, isListView) {
    if (typeof isListView == 'undefined') isListView = false;

    var extracted_row = {}
    for (key in row)
    {
      extracted_row[key] = row[key].value;
    }

    var compiled = MapsLib.infoboxCompiled({isListView: isListView ? "true" : "", row: extracted_row});
    return '<div class="infobox-container">' + compiled + '</div>';
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
        if (typeof(MapsLib.infoboxHTMLHelper) != 'undefined' && MapsLib.infoboxCompiled != null)
        {
            // NOTE: Google's InfoWindow API currently provides no way to shorten the tail,
            // which is problematic when viewing on a mobile device in landscape mode

            if (typeof e == 'undefined' || e == null) e = {};
            MapsLib.infoWindow.setOptions({
              content: MapsLib.infoboxHTMLHelper(e.row),
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

  searchRadiusMeters: function() {
    return (100 * Math.pow(2, (18-MapsLib.searchRadius)));
  },

  drawSearchRadiusCircle: function(point) {
    if (typeof MapsLib.searchRadiusCircle != 'undefined' && MapsLib.searchRadiusCircle != null)
    {
      MapsLib.searchRadiusCircle.setMap(null);
    }
    var circleOptions = {
      strokeColor: "#4b58a6",
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: "#4b58a6",
      fillOpacity: 0.05,
      map: MapsLib.map,
      center: point,
      clickable: false,
      zIndex: -1,
      radius: MapsLib.searchRadiusMeters()
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
      MapsLib.listViewRows = [];
      MapsLib.updateListView();
  },

  updateListView: function() {
      var whereClause = MapsLib.locationColumn + " not equal to ''";
      var orderClause = "";
      if (MapsLib.customSearchFilter.length > 0) {
        whereClause += " AND " + MapsLib.customSearchFilter;
      }
      // HACK: all we really want is the 10 rows that come after the existing MapsLib.listViewRows.
      //  but there's no way to get rows x to x+10 without also querying all the rows up to it.
      var limitClause = " LIMIT " + (MapsLib.listViewRows.length + 10);
      var centerPoint = (MapsLib.currentPinpoint != null) ? MapsLib.currentPinpoint : MapsLib.map.getCenter();

      if (centerPoint == null)
      {
        whereClause += limitClause;
      }
      else if (MapsLib.searchRadius > 0 && MapsLib.searchPage.distanceFilter.filterListResults)
      {
        whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + centerPoint.toString() + "," + MapsLib.searchRadiusMeters() + "))";
        whereClause += limitClause;
      }
      else
      {
        // FusionTable query limitation: There can at most be one spatial condition or "order by distance" condition.  We can't do both.
        orderClause = "ST_DISTANCE(" + MapsLib.locationColumn + ", LATLNG" + centerPoint.toString() + ")";
        orderClause += limitClause;
      }

      if (MapsLib.listViewRows.length == 0)
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
      var existingRows = MapsLib.listViewRows.length;
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
          MapsLib.listViewRows.push(row);

          var row_html = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="d" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-up-d"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a href="#page-map" id="listrow-' + ix + '" data-transition="slidedown" class="ui-link-inherit">';
          row_html += MapsLib.infoboxHTMLHelper(row, true);
          row_html += '</a></div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span></div></li>';

          $("ul#listview").append(row_html);

          $("a#listrow-" + ix).click(function(e) { 
            var index = e.currentTarget.id.split("-")[1]*1;
            MapsLib.selectedListRow = MapsLib.listViewRows[index];
            if (MapsLib.selectedListRow != undefined)
            {
              var thispos = new google.maps.LatLng(MapsLib.selectedListRow.latitude.value, MapsLib.selectedListRow.longitude.value);
              
              var row = MapsLib.selectedListRow;
              MapsLib.infoWindow.close();
              MapsLib.infoWindow.setOptions({
                  content: MapsLib.infoboxHTMLHelper(row, false),
                  position: new google.maps.LatLng(row.latitude.value, row.longitude.value),
                  pixelOffset: new google.maps.Size(0,-32)
                });
              MapsLib.queueInfobox = true;
              MapsLib.reCenterWhenReady();
            }
          });
      }
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
});
