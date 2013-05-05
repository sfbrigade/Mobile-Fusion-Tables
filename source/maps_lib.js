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
 */

var MapsLib = MapsLib || {};
var MapsLib = {

  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //the encrypted Table ID of your Fusion Table (found under File => About)
  //NOTE: numeric IDs will be depricated soon
  fusionTableId:      "1kjZeEXWdu2NmsWKFnMoqek4f0EV-dVIJjxMHg6w",

  //*New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyAMVBSXes-6P-gWaxRj20GK8NT6WDVpozM",

  //name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  //example: locationColumn:     "'my location'",
  locationColumn:     "latitude",

  map_centroid:       new google.maps.LatLng(37.75, -122.4), //center that your map defaults to
  locationScope:      "san francisco",      //geographical area appended to all address searches
  recordName:         "result",       //for showing number of results
  recordNamePlural:   "results",

  searchRadius:       805,            //in meters ~ 1/2 mile
  defaultZoom:        12,             //zoom level when map is loaded (bigger is more zoomed in)
  addrMarkerImage: 'http://derekeder.com/images/icons/blue-pushpin.png',
  currentPinpoint: null,

  // Complete control over infobox html for any element.
  // Also used by the 'list' view.
  writeInfoWindow: function(row, listView) {
    // Default the list_view to false, assuming infobox is for the map pop-up.
    if (typeof(listView)==='undefined') listView = false;

    // Helper function - in case column name is missing.
    getValue = function(columnName, defVal) {
        if (typeof(defVal)==='undefined') defVal='';
        return (row[columnName] || {"value" : defVal}).value;
    };

    html = "";
    //html = "<div class='infobox-container'>";
        // Score.
        html += "<div class='score " + getValue('last_score_category') + "'>";
        html += getValue('last_score','?');
        html += "</div>";
        // Business name. 
        html += "<h3 class='ui-li-heading'>" + getValue('name') + "</h3>";
        // Last inspection date.
        html += "<p class='ui-li-desc'><strong>";
        if (getValue('last_inspection_date') != '') {
            html += "Inspected " + getValue('last_inspection_date');
        } else {
            html += "No inspection result";
        }
        html += "</strong></p>";
        // Address.
        html += "<p class='ui-li-desc'>";
        if (getValue('address') != "") {
            html += getValue('address');
        }
        if (!listView && getValue('violation_1') != "") {
            // Violations if any (and not listview)
            html +=  "<br/><br/>";
            html += "<b>Recent violations:</b><br/>";
            html += "- " + getValue('violation_1');
            if (getValue('violation_2') != "") {
                html += "<br/>- " + getValue('violation_2');
            }
            if (getValue('violation_3') != "") {
                html += "<br/>- " + getValue('violation_3');
            }
        }
        html += "</p>";
        
    //html += "<div class='infobox-right'>";
        // Link to the detailed page.
        //html += "<a href='" + getValue('business_id') + ".html'>";
        //html += "<span class='moreinfo ui-icon ui-icon-arrow-r ui-icon-shadow'></span>";
        //html += "</a>";
    //html += "</div>"; // End infobox-right
    
    //html += "</div>"; // End infobox-container

    return html;
  },

  initialize: function() {
    $( "#result_count" ).html("");

   geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      streetViewControl: false,
      panControl: false,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);
     
    centerOnUser = function(position) {
        youarehere = new google.maps.LatLng(position.coords.latitude,
                                            position.coords.longitude);
        map.setCenter(youarehere);
        MapsLib.map_centroid = youarehere;
        map.setZoom(18);
    }

    getlocation = function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(centerOnUser);
        } else {
            alert("Your device is not sharing it's location.");
        }
        return false;
    }
    getlocation();
    // Wire up event handler for nearby button.
    $("a#nearby").click(function(e) {
        //e.stopImmediatePropagation();
        //e.preventDefault();
        getlocation();
        setTimeout("$('a#nearby').removeClass('ui-btn-active')", 500);
    }
    );

    $("a#listview").click(MapsLib.getListView);
 
    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });

    MapsLib.searchrecords = null;

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
    if (loadRadius != "") $("#search_radius").val(loadRadius);
    else $("#search_radius").val(MapsLib.searchRadius);
    $(":checkbox").attr("checked", "checked");
    $("#result_count").hide();
    
    //-----custom initializers-------
    
    //-----end of custom initializers-------

    //run the default search
    MapsLib.doSearch();
  },

  doSearch: function(location) {
    MapsLib.clearSearch();
    var address = $("#search_address").val();
    MapsLib.searchRadius = $("#search_radius").val();

    var whereClause = MapsLib.locationColumn + " not equal to ''";

    //-----custom filters-------

    //-------end of custom filters--------

    if (address != "" && address != undefined) {
      if (address.toLowerCase().indexOf(MapsLib.locationScope) == -1)
        address = address + " " + MapsLib.locationScope;

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', encodeURIComponent(MapsLib.searchRadius));
          map.setCenter(MapsLib.currentPinpoint);
          map.setZoom(14);

          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });

          whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

          MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
          MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else { //search without geocoding callback
      MapsLib.submitSearch(whereClause, map);
    }
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
      templateId: 3
    });
    google.maps.event.clearListeners(MapsLib.searchrecords, 'click');
    google.maps.event.addListener(MapsLib.searchrecords, 'click', function(e) {
        // Custom infoWindowHtml.
        
        // TODO: only if writeInfoWindow is a function.
        e.infoWindowHtml = MapsLib.writeInfoWindow(e.row);
    });
    MapsLib.searchrecords.setMap(map);
    MapsLib.getCount(whereClause);
  },

    clearSearch: function() {
    if (MapsLib.searchrecords != null)
      MapsLib.searchrecords.setMap(null);
    if (MapsLib.addrMarker != null)
      MapsLib.addrMarker.setMap(null);
    if (MapsLib.searchRadiusCircle != null)
      MapsLib.searchRadiusCircle.setMap(null);
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        MapsLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          MapsLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  drawSearchRadiusCircle: function(point) {
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
        radius: parseInt(MapsLib.searchRadius)
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
    }
  },

  getCount: function(whereClause) {
    var selectColumns = "Count()";
    MapsLib.query(selectColumns, whereClause, null, "MapsLib.displaySearchCount");
  },

  displaySearchCount: function(json) {
    MapsLib.handleError(json);
    var numRows = 0;
    if (json["rows"] != null)
      numRows = json["rows"][0];

    var name = MapsLib.recordNamePlural;
    if (numRows == 1)
    name = MapsLib.recordName;
    $( "#result_count" ).fadeOut(function() {
        $( "#result_count" ).html(MapsLib.addCommas(numRows) + " " + name + " found");
      });
    $( "#result_count" ).fadeIn();
  },

  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },

  getListView: function() {
      var whereClause = MapsLib.locationColumn + " not equal to ''";
      // TODO1: Where clause is the nearest 20 elements to the window center
      //        with optoin to fetch more.
      var orderClause = "ST_DISTANCE(latitude, LATLNG(" + map.getCenter().lat() + "," + 
                map.getCenter().lng() + ")) LIMIT 10";
      $("ul#listview").html('<li data-theme="c">Loading results...</li>');
      MapsLib.query("*", whereClause, orderClause, "MapsLib.displayListView");
  },

  displayListView: function(json) {
      MapsLib.handleError(json);
      // Empty the listview object.
      $("ul#listview").html("");

      for (var ix=0; ix<json.rows.length; ix++){
          // make row object.
          var row = {};
          for (var jx=0; jx<json.columns.length; jx++) {
              row[ json.columns[jx] ] = {"value" : json.rows[ix][jx]};
          }

          var row_html = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="d" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-up-d"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a href="todo.html" class="ui-link-inherit">';
          row_html += MapsLib.writeInfoWindow(row, true);
          row_html += '</a></div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span></div></li>';

          $("ul#listview").append(row_html);
      }
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return decodeURIComponent(text);
  }
  
  //-----custom functions-------
  // NOTE: if you add custom functions, make sure to append each one with a comma, except for the last one.
  // This also applies to the convertToPlainString function above
  
  //-----end of custom functions-------
}
