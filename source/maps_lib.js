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
  map_centroid:       null, // gets initialized below
  maxDistanceFromDefaultCenter: 0,
  nearbyZoomThreshold:-1,
  searchRadiusCircle: null,
  nearbyPosition:     null,
  overrideCenter:     false, 
  ignoreIdle:         false,
  locationColumn:     MapsLib.locationColumn || "",

  // markers
  addrMarker:         null,
  localMarker:        null,
  addrMarkerImage:    '//maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png',
  blueDotImage:       '//maps.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',
  currentPinpoint:    null,
  defaultPixelOffset: new google.maps.Size(0,-30),

  // infoboxes
  infoWindow:         new google.maps.InfoWindow({}),
  infoboxCompiled:    null,
  queueInfobox:       false,
  nearbyPinInfobox:   MapsLib.nearbyPinInfobox || "You are here.",
  addressPinInfobox:  MapsLib.addressPinInfobox || "{address}",

  // about
  defaultAboutPage:   " \
    <h3>About {title}</h3> \
    <p>This is a demonstration of a Mobile Template using Fusion Tables.  Developed by SF Brigade for Code For America, it's an adaptation of Derek Eder's searchable Fusion Table template, licensed under the <a href='https://github.com/derekeder/FusionTable-Map-Template/wiki/License' target='_blank'>MIT License</a>.</p> \
    <p>To use this template for your own Fusion Table data, <a href='https://github.com/sfbrigade/FusionTable-Map-MobileTemplate' target='_blank'>clone this repository</a> and replace the fields inside fusiontable_settings.js to match your content.</p> \
    ",

  // search and list
  searchPage:         MapsLib.searchPage || {},
  columns:            [],
  in_query:           false, 
  searchRadius:       0,
  customSearchFilter: "",
  listViewRows:       [],
  selectedListRow:    null,
  //unicode characters to not print to screen
  //From https://github.com/slevithan/XRegExp/blob/master/src/addons/unicode/unicode-categories.js#L28
  unicodeSet: /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFD\uFFFE\uFFFF]/g,


  stringExists: function(teststr) {
    return (typeof teststr != 'undefined' && teststr != null && teststr.length > 0);
  },

  updateTitle: function() {
    var aboutContent = MapsLib.default(MapsLib.defaultAboutPage, MapsLib.aboutPage);
    if (typeof MapsLib.title != 'undefined' && MapsLib.title != undefined)
    {
      document.title = MapsLib.title;
      $("#titlebar").text(MapsLib.title);
      $("#section-about").html(aboutContent.replace("{title}",MapsLib.title));
    }
    else
    {
      $("#section-about").html(aboutContent);
    }
  },

  default: function(defaultval, obj)
  {
    return (typeof obj == 'undefined' || obj == undefined) ? defaultval : obj;
  },

  initialize: function() {
    if (MapsLib.stringExists(MapsLib.customCSS))
    {
      var css = document.createElement("style");
      css.type = "text/css";
      css.innerHTML = MapsLib.customCSS;
      document.head.appendChild(css);
    }

    // fill in defaults for map settings
    MapsLib.mapDefaultCenter = MapsLib.default(new google.maps.LatLng(37.77, -122.45), MapsLib.mapDefaultCenter); // center on SF if all else fails
    MapsLib.map_centroid = MapsLib.mapDefaultCenter;
    MapsLib.defaultZoom = MapsLib.default(11, MapsLib.defaultZoom);
    MapsLib.useNearbyLocation = MapsLib.default({}, MapsLib.useNearbyLocation);
    MapsLib.useNearbyLocation.startAtNearbyLocation = MapsLib.default(true, MapsLib.useNearbyLocation.startAtNearbyLocation);
    // MapsLib.useNearbyLocation.onlyIfWithin: leave undefined
    MapsLib.useNearbyLocation.boundsExceededMessage = MapsLib.default("You're currently outside the furthest data point from center.  Defaulting to geographical center of data.", MapsLib.useNearbyLocation.boundsExceededMessage);
    MapsLib.useNearbyLocation.nearbyZoom = MapsLib.default(MapsLib.defaultZoom + 5, MapsLib.useNearbyLocation.nearbyZoom); 
    MapsLib.useNearbyLocation.snapToNearbyZoom = MapsLib.default(3, MapsLib.useNearbyLocation.snapToNearbyZoom);

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

    if (MapsLib.useNearbyLocation == false)
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

    // request list of columns
    var qstr = "https://www.googleapis.com/fusiontables/v1/tables/" + MapsLib.fusionTableId + "?callback=MapsLib.setColumns&key=" + MapsLib.googleApiKey;
    console.log("Query: " + qstr);
    $.ajax({url: qstr, dataType: "jsonp"});

    if (MapsLib.stringExists(MapsLib.customInfoboxTemplate))
    {
      MapsLib.infoboxCompiled = Handlebars.compile(MapsLib.customInfoboxTemplate);
    }
    MapsLib.updateTitle();

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
              $( "#alertMessageText" ).text(MapsLib.useNearbyLocation.boundsExceededMessage);
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
            whereClauses.push("'" + column + "' = '" + value + "'");
          }
          else
          {
            whereClauses.push("'" + column + "' CONTAINS IGNORING CASE '" + value + "'");
          }
        }
    });

    $("select[data-ref='custom']").each(function( index ) { 
      var clause = $(this).find(":selected").val();
      if (clause.length > 0)
      {
        whereClauses.push(clause);
      }
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
        if (MapsLib.addressScope != undefined && MapsLib.addressScope.replace(" ","") != "")
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
    else if ((MapsLib.searchPage.distanceFilter.dropDown.length > 0 || MapsLib.searchPage.searchByAddress) && (typeof hideRadius == 'undefined' || hideRadius == false) && MapsLib.map_centroid != undefined)
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

  infoboxContent: function(row, isListView, defaultContent) {
    if (typeof row == 'undefined' || row == null)
    {
      return null;
    }
    if (typeof isListView == 'undefined') isListView = false;
    var safe_row = {}
    for (key in row)
    {
      var safekey = key.replace(/ /g,"_").replace(/\./g,"");
      var safevalue = $(document.createElement('div')).html(row[key].value).text().replace(MapsLib.unicodeSet, ""); // using jQuery to decode "&amp;"->"&" and so on
      safe_row[safekey] = safevalue;
    }

    var infoboxContent = "";
    if (MapsLib.infoboxCompiled != null)
    {
      // using custom infobox
      var compiled = MapsLib.infoboxCompiled({isListView: isListView ? "true" : "", row: safe_row});
      infoboxContent = '<div class="infobox-container">' + compiled + '</div>';
    }
    else if (isListView || MapsLib.customInfoboxTemplate != "")
    {
      if ((typeof defaultContent != 'undefined' || defaultContent != undefined) &&
        defaultContent.indexOf("geometry:") == -1)  // no geometry information in the infobox
      {
        infoboxContent = defaultContent;
      }
      else
      {
        // Generate one infoboxContent, ignoring location column and empty values.
        infoboxContent = isListView ? '<div class="infobox-container">' : '<div class="googft-info-window">';
        infoboxContent += '<p class="infobox-default">';
        var limit = 4; // limit 4 lines per entry
        var ix = 0;
        for (var col in safe_row)
        {
          var val = safe_row[col];
          if (val == null || val == "") continue;
          if (col == MapsLib.locationColumn) continue;
          if (col == "longitude") continue; // HACK: latitude implies there's also a longitude column
          infoboxContent += "<b>" + col + ":</b> " + val + "<br/>";
          if (++ix >= limit) break;
        }
        infoboxContent += "</p></div>";
      }
    }
    return infoboxContent;
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

      // NOTE: Google's InfoWindow API currently provides no way to shorten the tail,
      // which is problematic when viewing on a mobile device in landscape mode

      if (typeof e == 'undefined' || e == null) e = {};
      MapsLib.defaultPixelOffset = e.pixelOffset;
      MapsLib.infoWindow.setOptions({
        content: MapsLib.infoboxContent(e.row, false, e.infoWindowHtml),
        position: e.latLng,
        pixelOffset: e.pixelOffset
      });
      MapsLib.infoWindow.open(map);
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
    var qstr = "https://www.googleapis.com/fusiontables/v1/query?sql=" + sql + "&callback=" + callback + "&key=" + MapsLib.googleApiKey;
    console.log("Query: " + qstr);
    $.ajax({url: qstr, dataType: "jsonp"});
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      var messages = []
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
        messages.push(error[row]["message"]);
      }
      if ($("#map_canvas").width() != 0 & $("#map_canvas").height() != 0)
      {
        $( "#alertMessageText" ).html("ERROR: please check your settings file!<ul><li>" + messages.join("<li>") + "</ul>");
        $( "#popupDialog" ).popup( "open" );
      }
      return true;
    }
  },

  setColumns: function(json) {
    if (MapsLib.handleError(json)) {
        return false;
    }
    if (typeof MapsLib.title == 'undefined' || MapsLib.title == undefined)
    {
      MapsLib.title = json["name"];
      MapsLib.updateTitle();
    }

    if (MapsLib.aboutPage == undefined && json["description"].length > 0)
    {
      $("#section-about").html(json["description"].replace(/\n/g,"<br/>"));
    }

    var all_columns = [];
    var num_columns = json["columns"].length;
    for (var i = 0; i < num_columns; i++)
    {
      var name = json["columns"][i]["name"];
      all_columns.push(name);
      if (MapsLib.locationColumn == "" && json["columns"][i]["type"] == "LOCATION")
      {
        MapsLib.locationColumn = name;
      }
    }
    // make sure location column has single quotes if it contains a space
    if (MapsLib.locationColumn.indexOf(" ") != -1)
    {
      MapsLib.locationColumn = "'" + MapsLib.locationColumn + "'";
      MapsLib.locationColumn = MapsLib.locationColumn.replace(/''/g,"'");
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

      var numRows = (json != undefined && json.rows != undefined) ? json.rows.length : 0;
      // we already have the first existingRows, we're just appending the remainder
      for (var ix=existingRows; ix<numRows; ix++){
          // make row object.
          var row = {};
          for (var jx=0; jx<json.columns.length; jx++) {
              row[ json.columns[jx] ] = {"value" : json.rows[ix][jx]};
          }
          MapsLib.listViewRows.push(row);

          var row_html = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="d" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-up-d"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a href="#page-map" id="listrow-' + ix + '" data-transition="slidedown" class="ui-link-inherit">';
          row_html += MapsLib.infoboxContent(row, true);
          row_html += '</a></div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span></div></li>';

          $("ul#listview").append(row_html);

          $("a#listrow-" + ix).click(function(e) { 
            var index = e.currentTarget.id.split("-")[1]*1;
            MapsLib.selectedListRow = MapsLib.listViewRows[index];
            if (MapsLib.selectedListRow != undefined)
            {
              MapsLib.infoWindow.close();
              var row = MapsLib.selectedListRow;
              if (MapsLib.locationColumn.toLowerCase() == "latitude")
              {
                MapsLib.infoWindow.setOptions({
                    content: MapsLib.infoboxContent(row, false),
                    position: new google.maps.LatLng(row.latitude.value, row.longitude.value),
                    pixelOffset: MapsLib.defaultPixelOffset
                  });
                MapsLib.queueInfobox = true;
                MapsLib.reCenterWhenReady();
              }
              else if (MapsLib.locationColumn.toLowerCase() == "geometry")
              {
                // HACK: can't seem to get a center point if map uses "geometry" polygons.  Just grab a corner instead.
                // There's a number of ways to get lng/lat from a geo (can be a point, a line, a polygon).
                var geo = row[MapsLib.locationColumn].value;
                var lnglat = ("geometries" in geo) ? geo.geometries[0].coordinates : geo.geometry.coordinates;
                while (lnglat[0] instanceof Array)
                {
                  lnglat = lnglat[0];
                }
                MapsLib.infoWindow.setOptions({
                    content: MapsLib.infoboxContent(row, false),
                    position: new google.maps.LatLng(lnglat[1], lnglat[0])
                  });
                MapsLib.queueInfobox = true;
                MapsLib.reCenterWhenReady();
              }
              else
              {
                // assuming that locationColumn is an address
                var address = row[MapsLib.locationColumn].value;
                geocoder.geocode( { 'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  var thispos = results[0].geometry.location;
                  MapsLib.infoWindow.setOptions({
                      content: MapsLib.infoboxContent(MapsLib.selectedListRow, false),
                      position: new google.maps.LatLng(thispos.lat(), thispos.lng()),
                      pixelOffset: MapsLib.defaultPixelOffset
                    });
                  MapsLib.queueInfobox = true;
                  MapsLib.reCenterWhenReady();
                }
              });
            }
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
