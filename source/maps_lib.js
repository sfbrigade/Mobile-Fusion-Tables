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
    maxDistanceFromDefaultCenter: 0,
    nearbyZoomThreshold:-1,
    searchRadiusCircle: null,
    userPosition:       null,
    nearbyPosition:     null,
    overrideCenter:     false, 
    centerQueued:       false,
    ignoreIdle:         false,
    mapState:           true,
    geocoder:           new google.maps.Geocoder(),

    // data
    numericalColumns:   [],
    dateColumns:        [],
    timeColumns:        [],
    columnRanges:       {},
    searchColumns:      [], // storing this for resetSearch
    variantColumns:     [], // excluding columns where the min/max are the same
    outstandingQueries: 0,

    // map overrides
    useNearbyLocation:  MapsLib.useNearbyLocation || {},
    locationColumn:     MapsLib.locationColumn || "",
    safeLocationColumn: MapsLib.locationColumn || "",
    secondaryLocationColumn: "",
    defaultMapBounds:   {},
    mapOverlays:        MapsLib.mapOverlays || [],
    styleId:            (MapsLib.styleId == 0) ? 0 : (MapsLib.styleId || 2),
    templateId:         (MapsLib.templateId == 0) ? 0 : (MapsLib.templateId || 3),
    mapOverlayLayers:   [],
    mapOverlayOrder:    [],
    map_centroid:       new google.maps.LatLng(37.77, -122.45), // center on SF if all else fails
    defaultZoom:        9,

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
    <p>To use this template for your own Fusion Table data, <a href='https://github.com/sfbrigade/Mobile-Fusion-Tables' target='_blank'>clone this repository</a> and replace the fields inside fusiontable_settings.js to match your content.</p> \
    ",

    // search and list
    searchPage:         MapsLib.searchPage || {},
    columns:            [],
    in_query:           false, 
    searchRadiusMeters: 0,
    customSearchFilter: "",
    listViewRows:       [],
    listViewSortByColumn: MapsLib.listViewSortByColumn || "",
    datesInitialized:  false, 
    selectedListRow:    null,
    //unicode characters to not print to screen
    //From https://github.com/slevithan/XRegExp/blob/master/src/addons/unicode/unicode-categories.js#L28
    unicodeSet : /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFD\uFFFE\uFFFF]/g,

    loadedResources:    {},
    onEnterMap : function() {
        if (!MapsLib.mapState)
        {
            MapsLib.mapState = true;
            MapsLib.reCenterWhenReady();
            $.mobile.changePage("#page-map");
        }
    },
    onExitMap: function() {
        if (MapsLib.mapState)
        {
            MapsLib.mapState = false;
            MapsLib.ignoreIdle = true;
        }
    },
    onPopState: function() {
        var nonMaps = ["#page-search", "#page-about", "#page-list"];
        var inMap = true;
        $.each(nonMaps, function(i, tag)
        {
            if (window.location.href.indexOf(tag) != -1)
            {
                inMap = false;
                return false;
            }
        });
        if (inMap)
        {
            if (MapsLib.mapState == false)
            {
                // entered map via browser
                MapsLib.onEnterMap();
            }
        } 
        else if (MapsLib.mapState == true)
        {
            // exited map via browser
            MapsLib.onExitMap();
        }
    },
    stringExists: function(teststr) {
        return (typeof teststr != 'undefined' && teststr != null && teststr.length > 0);
    },
    getDefault: function(defaultval, obj)
    {
        return (typeof obj == 'undefined' || obj == undefined) ? defaultval : obj;
    },
    updateTitle: function() {
        var aboutContent = MapsLib.getDefault(MapsLib.defaultAboutPage, MapsLib.aboutPage);
        if (typeof MapsLib.title != 'undefined' && MapsLib.title != undefined)
        {
            document.title = MapsLib.title;
            $("#titlebar").text(MapsLib.title);
            $("#section-about").html(aboutContent.replace("{title}", MapsLib.title));
        } 
        else
        {
            $("#section-about").html(aboutContent);
        }
    },
    isStringColumn: function(name)
    {
        return ($.inArray(name, MapsLib.numericalColumns) == -1 && 
                $.inArray(name, MapsLib.dateColumns) == -1 && 
                $.inArray(name, MapsLib.timeColumns) == -1);
    },
    getDateString: function(val, zeroIndexMonth)
    {
        var dateVal = val;
        if (!(val instanceof Date))
        {
            dateVal = new Date(val);
        }
        var month = dateVal.getMonth();
        if (zeroIndexMonth != true)
        {
            month += 1;
        }
        var day = dateVal.getDate();
        var str = ((month < 10) ? "0" : "") + month;
        str += "/" + ((day < 10) ? "0" : "") + day;
        str += "/" + dateVal.getFullYear();
        return str;
    },
    // saves the min and max dates for sliders
    sliderMinMaxResult: function(json) {
        var minMaxHelper = function(val)
        {
            return isNaN(val) ? new Date(val) : val;
        }
        var safeNum = function(val) {
            return (val instanceof Date) ? val.getTime() : val;
        }
        var numrows = json["rows"] ? json["rows"].length : 0;
        if (numrows > 0)
        {
            var numcols = json["columns"] ? json["columns"].length : 0;
            for (var i = 0; i < numcols; i++)
            {
                colname = json["columns"][i];
                var isMin = (colname.substring(0,7) == "MINIMUM");
                colname = colname.substring(8, colname.length-1);
                if (isMin)
                {
                    MapsLib.columnRanges[colname].minVal = MapsLib.typesetRangeValue(json["rows"][0][i], colname);
                }
                else
                {
                    MapsLib.columnRanges[colname].maxVal = MapsLib.typesetRangeValue(json["rows"][0][i], colname);
                }
                if (safeNum(MapsLib.columnRanges[colname].minVal) != safeNum(MapsLib.columnRanges[colname].maxVal))
                {
                    const columnName = MapsLib.safeField(colname)
                    if (MapsLib.variantColumns.indexOf(columnName) == -1)
                    {
                        MapsLib.variantColumns.push(columnName);
                    }
                }
            }
        }
        if (--MapsLib.outstandingQueries <= 0)
        {
            // HACK: the sliders' layouts are messed up unless we repopulate the html after slider()
            $("#section-search").html(MapsLib.searchHtml());
            MapsLib.initSearchFieldCallbacks();
        }
    },
    // Q: What do Google Maps' zoom values represent?
    // A: They're exponential power values, where
    // - zoom of X+1 zooms in to half the radius of X.
    // - zoom of 14 = radius of 1 km in a 320px window (1 mile in a 520px window)
    zoomFromRadiusMeters: function(meters) {
        if (meters == 0) 
            return 0; // don't return infinity
        var min_diameter = Math.min($(document).width(), $(document).height());
        var radiusMiles360px = (360 * meters) / (1610 * min_diameter);
        return 13 - Math.round(Math.log(radiusMiles360px) / Math.LN2);
    }, 
    radiusMetersFromZoom: function(zoom) {
        if (zoom == 0) 
            return 0;
        var min_diameter = Math.min($(document).width(), $(document).height());
        var radiusMiles360px = Math.pow(2, 13 - zoom);
        return (1610 * radiusMiles360px * min_diameter / 360); // 1610 meters/mile
    },
    metersFromString: function(str) {
        var tokens = str.split(" ");
        var meters = tokens[0] * 1;
        if (!isNaN(meters) && meters > 0 && (tokens[1] == "miles" || tokens[1] == "mile"))
        {
            meters *= 1610;
        }
        return meters;
    },
    // taken from http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
    loadResource: function(filename, filetype) {
    var fileref = MapsLib.loadedResources[filename];
     if (fileref != undefined) {
        return fileref;
     }
     if (filetype == "js") {
      fileref = document.createElement('script');
      fileref.setAttribute("type","text/javascript");
      fileref.setAttribute("src", filename);
     }
     else if (filetype == "css") { 
      fileref = document.createElement("link");
      fileref.setAttribute("rel", "stylesheet");
      fileref.setAttribute("type", "text/css");
      fileref.setAttribute("href", filename);
     }
     MapsLib.loadedResources[filename] = fileref;
     if (typeof fileref != "undefined")
     {
        document.getElementsByTagName("head")[0].appendChild(fileref);
        return fileref;
     }
    },
    loadDatepickerFiles: function() {
        MapsLib.loadResource("source/picker.default_plus_date.min.css", "css");
        var script = MapsLib.loadResource("source/picker.plus_date.min.js", "js");
        if (window.location.href.indexOf("#page-search") != -1)
        {
            script.onload = function() {
                MapsLib.initDatepickers();
            };
        }
    },
    initDatepickers: function() {
        if (!MapsLib.datesInitialized)
        {
            MapsLib.datesInitialized = true;

            $("input[data-dtype='date']").each(function( index ) {
                var value = $(this).val();

                var name = $(this).attr("data-field");
                var range = MapsLib.columnRanges[name];
                var dateFormat = $(this).attr("data-format") || 'mm/dd/yyyy';
                var dateRange = {};
                if (range != undefined)
                {
                    if (range.minVal != 0)
                    {
                        dateRange['from'] = [range.minVal.getFullYear(),range.minVal.getMonth(),range.minVal.getDate()];
                    }
                    if (range.maxVal != 0)
                    {
                        dateRange['to'] = [range.maxVal.getFullYear(),range.maxVal.getMonth(),range.maxVal.getDate()];
                    }
                }
                if (range.length)
                {
                    $(this).pickadate({ format: dateFormat, disable: [true, dateRange], today: '', clear: '' });
                }
                else
                {
                    $(this).pickadate({ format: dateFormat, today: '', clear: '' });
                }
            });
        }
        else
        {
            $("input[data-dtype='date']").each(function( index ) {
                $(this).pickadate('picker').close();
                $(this).blur();
            });
        }
    },
    initDefaults: function() {
        // fill in defaults for searchPage settings
        var searchPageDefaults = {
            allColumns: true,
            allColumnsExactMatch: false,
            addressShow: true,
            addressAutocomplete: {},
            distanceFilter: {},
            columns: [] 
        };
        var distanceFilterDefaults = {
            filterSearchResults: true,
            filterListResults: true,
            entries: [] 
        };
        for (key in searchPageDefaults)
        {
            if (!(key in MapsLib.searchPage)) 
                MapsLib.searchPage[key] = searchPageDefaults[key];
        }
        for (key in distanceFilterDefaults)
        {
            if (!(key in MapsLib.searchPage.distanceFilter)) 
                MapsLib.searchPage.distanceFilter[key] = distanceFilterDefaults[key];
        }
        if (MapsLib.searchPage.addressAutocomplete != false && !("country" in MapsLib.searchPage.addressAutocomplete))
        {
            // default to US
            MapsLib.searchPage.addressAutocomplete.country = "us";
        }
    },
    conformSchema: function() {
        if (MapsLib.schemaVersion == 2)
        {
            return;
        }

        // conform old settings schema to new layout
        var usingOldSchema = false;
        if (("distanceFilter" in MapsLib.searchPage) && ("dropDown" in MapsLib.searchPage.distanceFilter))
        {
            usingOldSchema = true;
            MapsLib.searchPage.distanceFilter.entries = MapsLib.searchPage.distanceFilter.dropDown;
            delete MapsLib.searchPage.distanceFilter.dropDown;
        }
        if (MapsLib.searchPage.dropDowns != undefined)
        {
            $.each(MapsLib.searchPage.dropDowns, function(i, cdata) {
                usingOldSchema = true;
                cdata.type = "dropdown";
                cdata.entries = cdata.options;
                delete cdata.options;
                MapsLib.searchPage.columns.splice(0,0,cdata);
            });
        }
        $.each(MapsLib.searchPage.columns, function(i, cdata) {
            if (cdata.type == undefined)
            {
                usingOldSchema = true;
                cdata.type = (cdata.range == true) ? "slider" : "text";
                delete cdata.range;
            }
        });
        if (usingOldSchema)
        {
            console.log('WARNING: Your fusiontable_settings.js is using deprecated attributes for "searchPage".  Please refer to the samples directory to see current examples.');
        }
    },

    initialize: function() {
        // override table ID if passed in through URL
        var urltokens = window.location.href.split("?");
        if (urltokens.length >= 2)
        {
            var first_arg = urltokens[1].split("#")[0].split("&")[0];
            if (first_arg.indexOf("key=") == 0)
            {
                MapsLib.fusionTableId = first_arg.substring(4, first_arg.length);
                console.log(MapsLib.fusionTableId);
            }
        }

        if (MapsLib.stringExists(MapsLib.customCSS))
        {
            var css = document.createElement("style");
            css.type = "text/css";
            css.innerHTML = MapsLib.customCSS;
            document.head.appendChild(css);
        }

        // set default secondary location column
        switch (MapsLib.locationColumn)
        {
        case "latitude":
            MapsLib.secondaryLocationColumn = "longitude";
            break;
        case "Latitude":
            MapsLib.secondaryLocationColumn = "Longitude";
            break;
        case "lat":
            MapsLib.secondaryLocationColumn = "lng";
            break;
        case "Lat":
            MapsLib.secondaryLocationColumn = "Lng";
            break;
        default:
            break;
        }

        MapsLib.initDefaults();
        MapsLib.conformSchema();

        if ("center" in MapsLib.defaultMapBounds)
        {
            if (MapsLib.defaultMapBounds.center instanceof Array)
            {
                MapsLib.map_centroid = new google.maps.LatLng(MapsLib.defaultMapBounds.center[0], MapsLib.defaultMapBounds.center[1]);
                MapsLib.defaultMapBounds.center = MapsLib.map_centroid;
            } 
            else
            {
                MapsLib.centerQueued = true;
                var address = MapsLib.defaultMapBounds.center;
                MapsLib.defaultMapBounds.center = MapsLib.map_centroid;
                MapsLib.geocoder.geocode( {
                        'address': address 
                    }, 
                    function(results, status) {
                        MapsLib.centerQueued = false;
                        if (status == google.maps.GeocoderStatus.OK) {
                            MapsLib.defaultMapBounds.center = results[0].geometry.location;
                            if (MapsLib.userPosition == null)
                            {
                                MapsLib.currentPinpoint = MapsLib.defaultMapBounds.center;
                                MapsLib.map.setCenter(MapsLib.defaultMapBounds.center);
                                MapsLib.map.setZoom(MapsLib.defaultZoom);
                                MapsLib.map_centroid = MapsLib.defaultMapBounds.center;
                            } 
                            else
                            {
                                updateCenter(MapsLib.userPosition);
                            }
                            MapsLib.defaultMapBounds.bounds = new google.maps.Circle({
                                center: MapsLib.defaultMapBounds.center,
                                radius: MapsLib.defaultMapBounds.radius
                            }).getBounds();
                            MapsLib.updateAutocompleteBounds();
                        }
                    }
                );
            }
        } 
        else
        {
            MapsLib.defaultMapBounds.center = MapsLib.map_centroid;
            if (MapsLib.searchPage.addressAutocomplete != false)
            {
                MapsLib.searchPage.addressAutocomplete.useDefaultMapBounds = false;
            }
        }
        if ("radius" in MapsLib.defaultMapBounds)
        {
            MapsLib.defaultMapBounds.radius = MapsLib.metersFromString(MapsLib.defaultMapBounds.radius);
            MapsLib.defaultZoom = MapsLib.zoomFromRadiusMeters(MapsLib.defaultMapBounds.radius);
        } 
        else
        {
            MapsLib.defaultMapBounds.radius = MapsLib.radiusMetersFromZoom(MapsLib.defaultZoom);
        }
        MapsLib.defaultMapBounds.bounds = new google.maps.Circle({
            center: MapsLib.defaultMapBounds.center,
            radius: MapsLib.defaultMapBounds.radius
        }).getBounds();

        if (MapsLib.useNearbyLocation == false)
        {
            MapsLib.maxDistanceFromDefaultCenter = 0;
            $("#nearby-name").text("Home");
        } 
        else 
        {
            // fill in defaults for useNearbyLocation settings
            var nearbyLocationDefaults = {
                startAtNearbyLocation: true,
                boundsExceededMessage: "You're currently outside the furthest data point from center.  Defaulting to geographical center of data.",
                nearbyZoom: MapsLib.defaultZoom + 5,
                snapToNearbyZoomIfRatioGreaterThan: 8
            }; // leave onlyWithinDefaultMapBounds undefined
            for (key in nearbyLocationDefaults)
            {
                if (!(key in MapsLib.useNearbyLocation)) 
                    MapsLib.useNearbyLocation[key] = nearbyLocationDefaults[key];
            }
            if ("nearbyZoomRadius" in MapsLib.useNearbyLocation)
            {
                var radiusMeters = MapsLib.metersFromString(MapsLib.useNearbyLocation.nearbyZoomRadius);
                MapsLib.useNearbyLocation.nearbyZoom = MapsLib.zoomFromRadiusMeters(radiusMeters);
            }

            MapsLib.nearbyZoomThreshold = MapsLib.useNearbyLocation.snapToNearbyZoomIfRatioGreaterThan;
            if (MapsLib.nearbyZoomThreshold == true)
            {
                MapsLib.nearbyZoomThreshold = 0;
            } 
            else if (MapsLib.nearbyZoomThreshold != false)
            {
                // convert from linear magnitude to zoom scale
                MapsLib.nearbyZoomThreshold = Math.round(Math.log(MapsLib.nearbyZoomThreshold) / Math.LN2);
            }

            if (!("onlyWithinDefaultMapBounds" in MapsLib.useNearbyLocation))
            {
                // always use default location
                MapsLib.maxDistanceFromDefaultCenter = -1;
            } 
            else
            {
                MapsLib.maxDistanceFromDefaultCenter = MapsLib.defaultMapBounds.radius;
            }
        }

        $("#search_page").click(function() { 
            // HACK: calling pickadate too soon results in the popup happening outside the screen bounds
            setTimeout("MapsLib.initDatepickers();", MapsLib.datesInitialized ? 0 : 2000);
        });

        // request list of columns
        var qstr = "https://www.googleapis.com/fusiontables/v1/tables/" + MapsLib.fusionTableId + "?maxResults=100&callback=MapsLib.setColumns&key=" + MapsLib.googleApiKey;
        console.log("Query: " + qstr);
        $.ajax({
            url: qstr,
            dataType: "jsonp"
        });

        if (typeof MapsLib.customInfoboxHtml == "string")
        {
            if (MapsLib.customInfoboxHtml != "")
            {
                // compile Handlebars template
                var script = MapsLib.loadResource("source/handlebars.js", "js");
                script.onload = function() {
                    MapsLib.infoboxCompiled = Handlebars.compile(MapsLib.customInfoboxHtml);
                };
            }
        } 
        else if (MapsLib.customInfoboxHtml != undefined)
        {
            // customInfoboxHtml is already a function
            MapsLib.infoboxCompiled = MapsLib.customInfoboxHtml;
        }
        MapsLib.updateTitle();

        var myOptions = {
            zoom: MapsLib.defaultZoom,
            center: MapsLib.map_centroid,
            streetViewControl: false,
            panControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // hide map until we get current location (to avoid snapping)
        $("#map_canvas").css("visibility", "hidden");
        MapsLib.map = new google.maps.Map($("#map_canvas")[0], myOptions);

        MapsLib.searchrecords = new google.maps.FusionTablesLayer({
            query: {},
            styleId: MapsLib.styleId,
            templateId: MapsLib.templateId,
            suppressInfoWindows: true
        });
        
        // add map overlays
        var overlayIndices = [];
        $.each(MapsLib.mapOverlays, function(i, entry)
        {
            if (typeof entry == 'string')
            {
                // entry is a FusionTable ID
                var mapLayer = new google.maps.FusionTablesLayer({
                    query: {
                        from: entry
                    },
                    styleId: MapsLib.styleId,
                    templateId: MapsLib.templateId,
                    map: MapsLib.map,
                    suppressInfoWindows: true
                });

                google.maps.event.addListener(mapLayer, 'click', function(e) {
                    if (typeof e == 'undefined' || e == null) 
                        e = {};
                    MapsLib.infoWindow.setOptions({
                        content: e.infoWindowHtml,
                        position: e.latLng,
                        pixelOffset: e.pixelOffset
                    });
                    MapsLib.infoWindow.open(MapsLib.map);
                });
                MapsLib.mapOverlayLayers.push(mapLayer);
                overlayIndices.push(i);
            } 
            else
            {
                // entry is a ground overlay
                var imageBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(entry.cornerNW[0], entry.cornerNW[1]),
                new google.maps.LatLng(entry.cornerSE[0], entry.cornerSE[1]));

                var overlay = new google.maps.GroundOverlay(entry.imageURL, imageBounds);
                entry.opacityPercent = entry.opacityPercent || 50;
                overlay.setOpacity(entry.opacityPercent / 100);
                overlay.setMap(MapsLib.map);
                MapsLib.mapOverlayLayers.push(overlay);
                overlayIndices.push(i);
            }
        });

        MapsLib.setLayerVisibility(overlayIndices);

        // add to list view when user scrolls to the bottom
        $(window).scroll(function() {
            if (MapsLib.listViewRows.length == 0) 
                return;

            var listHeight = $("#page-list").height();
            if (MapsLib.listViewRows.length == 10)
            {
                // HACK: the page-list height isn't properly updated the first time, so
                // hard-code 10 * min height of cell
                listHeight = 700;
            }
            if (!MapsLib.in_query && $(window).scrollTop() + $(window).height() >= listHeight - 100) {
                MapsLib.updateListView();
            }
        });

        updateCenter = function(userPosition) {
            var useNearbyPosition = true;
            MapsLib.userPosition = userPosition;

            // don't follow user if maxDistanceFromDefaultCenter is 0
            if (!MapsLib.useNearbyLocation || userPosition == null)
            {
                useNearbyPosition = false;
            } 
            else
            {
                MapsLib.nearbyPosition = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
                if (!MapsLib.centerQueued && MapsLib.maxDistanceFromDefaultCenter > 0)
                {
                    // check our distance from the default center
                    var dist = google.maps.geometry.spherical.computeDistanceBetween(MapsLib.nearbyPosition, MapsLib.defaultMapBounds.center);
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
                MapsLib.currentPinpoint = MapsLib.defaultMapBounds.center;
                MapsLib.map.setCenter(MapsLib.defaultMapBounds.center);
                MapsLib.map.setZoom(MapsLib.defaultZoom);
                MapsLib.map_centroid = MapsLib.defaultMapBounds.center;
            } 
            else
            {
                if (MapsLib.nearbyZoomThreshold != -1 && (Math.abs(MapsLib.map.getZoom() - MapsLib.useNearbyLocation.nearbyZoom) >= MapsLib.nearbyZoomThreshold))
                {
                    MapsLib.map.setZoom(MapsLib.useNearbyLocation.nearbyZoom);
                }
                MapsLib.currentPinpoint = MapsLib.nearbyPosition;
                MapsLib.map.setCenter(MapsLib.nearbyPosition);
                MapsLib.map_centroid = MapsLib.nearbyPosition;
                if (MapsLib.localMarker == null)
                {
                    MapsLib.localMarker = new google.maps.Marker({
                        position: MapsLib.nearbyPosition,
                        map: MapsLib.map,
                        icon: MapsLib.blueDotImage,
                        animation: google.maps.Animation.DROP,
                        title: "You are here."
                    });
                }
                else if (MapsLib.localMarker.map != MapsLib.map)
                {
                    MapsLib.localMarker.setMap(MapsLib.map);
                }
                if (MapsLib.stringExists(MapsLib.nearbyPinInfobox))
                {
                    google.maps.event.addListener(MapsLib.localMarker, 'click', function() {
                        MapsLib.infoWindow.setOptions({
                            content: '<div class="infobox-container">' + MapsLib.nearbyPinInfobox + '</div>',
                            position: MapsLib.nearbyPosition,
                            pixelOffset: new google.maps.Size(0, -32)
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

        getlocation = function() {
            if (navigator.geolocation) {
                var options = {
                    timeout: 5000
                };
                navigator.geolocation.getCurrentPosition(updateCenter, locationError, options);
            } 
            else 
            {
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

        // Wire up event handler for nearby button.
        $("#nearby").click(function(e) {
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
        });

        // maintains map centerpoint for responsive design
        google.maps.event.addDomListener(MapsLib.map, 'idle', function() {
            $("#map_canvas").css("visibility", "visible");
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

    },
    updateAutocompleteBounds: function() {
        var settings = MapsLib.searchPage.addressAutocomplete;
        if (settings != false)
        {
            // initialize Autocomplete
            var options = {};
            if (settings.country)
            {
                options["componentRestrictions"] = {
                    country: settings.country 
                };
            }
            if (settings.useDefaultMapBounds != false)
            {
                options["bounds"] = MapsLib.defaultMapBounds.bounds;
            }
            MapsLib.autocomplete = new google.maps.places.Autocomplete($("#search_address")[0], options);
        }
    },
    initSearchFieldCallbacks: function() {
        MapsLib.updateAutocompleteBounds();
        if ('ontouchstart' in window || 'onmsgesturechange' in window)
        {
            // Touch screens only: dismiss keyboard when user hits return in input fields
            $('input').keypress( function( e ) {
                var code = e.keyCode || e.which;
                if ( code === 13 ) {
                    e.preventDefault();
                    document.activeElement.blur();
                    $('input').blur();
                    return false;
                }
            })
        }
        if (window.location.href.indexOf("#page-search") != -1)
        {
            // launched directly into the search page: redraw search fields
            $("#section-search").trigger('create');
            $("#section-search").css("visibility", "visible");
        }
    },
    // RECURSIVE HACK: There's a race condition between Google Maps and JQuery Mobile
    // So the following code resolves map redraw and centering issues on mobile devices
    reCenterWhenReady: function() {
        if ($("#map_canvas").width() == 0 || $("#map_canvas").height() == 0 || MapsLib.queueInfobox == true)
        {
            // window still size 0, keep waiting
            setTimeout("MapsLib.reCenterWhenReady()", 500);
        } 
        else 
        {
            MapsLib.ignoreIdle = false;
            google.maps.event.trigger(MapsLib.map, 'resize');

            if (MapsLib.queueInfobox != false)
            {
                MapsLib.map_centroid = MapsLib.infoWindow.location ? MapsLib.infoWindow.location : MapsLib.queueInfobox;
                MapsLib.map.setCenter(MapsLib.map_centroid);
                MapsLib.queueInfobox = false;
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
    resetSearch: function() {
        var settings = MapsLib.searchPage;
        if (settings.addressShow)
        {
            $("#search_address").val("");
        }

        if (settings.distanceFilter.entries.length > 0)
        {
            var distances = settings.distanceFilter.entries;
            for (var i = 0; i < distances.length; i++)
            {
                var distEntry = distances[i]; // format: [zoom, label, true if selected]
                if (distEntry.length > 2 && distEntry[2] == true)
                {
                    $("#search_radius option")[i].selected = true;
                    $("#search_radius").selectmenu('refresh');
                    break;
                }
            }
        }

        $.each(settings.columns, function(i, cdata)
        {
            switch (cdata.type)
            {
                case "dropdown":
                {
                    var safename = MapsLib.safeField(cdata.label);
                    var full_id = "#sc_" + safename;
                    var entries = cdata.entries;
                    for (var j = 0; j < entries.length; j++)
                    {
                        var entry = entries[j];
                        if (entry instanceof Array && entry.length > 2 && entry[2] == true)
                        {
                            $(full_id + " option")[j].selected = true;
                            $(full_id).selectmenu('refresh');
                            break;
                        }
                    }
                }
                break;

                case "checkbox":
                {
                    var safename = MapsLib.safeField(cdata.label);
                    var full_id = '#sc_' + safename;
                    $(full_id).attr("checked",(cdata.is_checked == true)).checkboxradio("refresh");
                }
                break;

                case "slider":
                {
                    var safename = MapsLib.safeField(cdata.column);
                    var range = MapsLib.columnRanges[cdata.column];
                    var fmin = range.minVal;
                    var fmax = range.maxVal;

                    if ($.inArray(cdata.column, MapsLib.dateColumns) != -1)
                    {
                        fmin = MapsLib.getDateString(range.minVal);
                        fmax = MapsLib.getDateString(range.maxVal);
                    }
                    var idmin = '#sc_min_' + safename;
                    $(idmin).val(fmin);
                    $(idmin).slider('refresh');

                    var idmax = '#sc_max_' + safename;
                    $(idmax).val(fmax);
                    $(idmax).slider('refresh');
                }
                break;

                case "datepicker":
                case "text":
                {
                    var safename = MapsLib.safeField(cdata.column);
                    var full_id = '#sc_' + safename;
                    $(full_id).val("");
                }
                break;
            }

        });
    },
    // Creates HTML content for search page given searchPage settings
    // See commentary above searchPage definition (in settings file) for data layout
    searchHtml: function() {
        var html = [];
        var settings = MapsLib.searchPage;
        if (settings.addressShow)
        {
            html.push("<label for='search_address'>Address / Intersection:</label>");
            html.push("<input class='input-block-level' data-clear-btn='true' id='search_address' placeholder='defaults to map center' type='text' />");
        }
        if (settings.distanceFilter.entries.length > 0)
        {
            html.push("<hr><label for='search_radius'>Within:</label>");
            html.push("<select class='input-small' id='search_radius'>");
            var distances = settings.distanceFilter.entries;
            for (var i = 0; i < distances.length; i++)
            {
                var distEntry = distances[i]; // format: [zoom, label, true if selected]
                var label = distEntry[0];
                var zoomstring = (distEntry.length > 1) ? distEntry[1] : distEntry[0];
                var radiusMeters = MapsLib.metersFromString(zoomstring);
                var selected = (distEntry.length > 2 && distEntry[2] == true) ? ' selected="selected"' : "";
                html.push("<option value='" + radiusMeters + "'" + selected + ">" + label + "</option>");
            }
            html.push("</select>");
        }

        var searchFields = settings.columns;
        if (settings.allColumns || settings.allColumnsExactMatch)
        {
            var customColumns = [];
            // remove custom columns from searchFields, they'll be reinserted in column order
            searchFields = [];
            $.each(settings.columns, function(i, cdata) {
                if (cdata.column == undefined)
                {
                    searchFields.push(cdata);
                }
                else
                {
                    customColumns.push(cdata.column);
                }
            });

            $.each(MapsLib.columns, function(i, cname)
            {
                var colLower = cname.toLowerCase();
                if ($.inArray(colLower, ["latitude", "longitude", "geometry", "shape"]) != -1) 
                    return true;
                // skip address field if addressSearched is true
                if (MapsLib.searchPage.addressShow && $.inArray(colLower, ["address", "city", "state", "postal_code", "zipcode", "zip_code"]) != -1) 
                    return true;

                var cIndex = $.inArray(cname, customColumns);
                if (cIndex >= 0)
                {
                    searchFields.push(settings.columns[cIndex]);
                } 
                else if (cname in MapsLib.columnRanges)
                {
                    searchFields.push({
                        type: "slider",
                        column: cname,
                        label: cname
                    });
                }
                else
                {
                    searchFields.push({
                        type: "text",
                        column: cname,
                        label: cname,
                        exact_match: settings.allColumnsExactMatch
                    });
                }
            });
        }

        MapsLib.searchColumns = [];
        if (Object.keys(MapsLib.columnRanges).length > 0)
        {
            MapsLib.searchPage.columns = searchFields;
        }
        $.each(searchFields, function(i, cdata)
        {
            switch (cdata.type)
            {
                case "text":
                {
                    var safename = MapsLib.safeField(cdata.column);
                    MapsLib.searchColumns.push(cdata.column);
                    var comparator = "=";
                    var placeholder = "Exact match";
                    if (cdata.exact_match)
                    {
                        placeholder = "Exact match (case-sensitive)";
                    }
                    else if (MapsLib.isStringColumn(cdata.column))
                    {
                        comparator = "CONTAINS IGNORING CASE";
                        placeholder = "Match anything containing this text";
                    }
                    html.push("<hr><label for='sc_" + safename + "'>" + cdata.label + ":</label>");
                    html.push("<input class='input-block-level' data-clear-btn='true' data-ref='column' data-field='" + 
                    cdata.column + "' data-compare='" + comparator + "' id='sc_" + safename + "' placeholder='" + 
                    placeholder + "' type='text' />");
                }
                break;

                case "datepicker":
                {
                    MapsLib.loadDatepickerFiles();
                    var safename = MapsLib.safeField(cdata.column);
                    MapsLib.searchColumns.push(cdata.column);

                    html.push("<hr><label for='sc_" + safename + "'>" + cdata.label + ":</label>");
                    html.push("<input class='input-block-level' data-clear-btn='true' data-ref='column' readonly='true' data-field='" + 
                    cdata.column + "' data-dtype='date' data-format='" + (cdata.format || "") + "' data-compare='=' id='sc_" + safename + "' type='text' />");
                }
                break;

                case "slider":
                {
                    if (MapsLib.isStringColumn(cdata.column))
                    {
                        console.log("WARNING: using slider for non-numerical, non-date column (" + cdata.column + ")!  Your searches won't work properly.")
                    }
                    var safename = MapsLib.safeField(cdata.column);
                    var range = MapsLib.columnRanges[cdata.column];
                    if (range != undefined)
                    {
                        var dtype = "number";
                        var fmin = range.minVal;
                        var fmindate = fmin;
                        var fmax = range.maxVal;
                        var fmaxdate = fmax;
                        var isDate = ($.inArray(cdata.column, MapsLib.dateColumns) != -1);
                        var isTime = ($.inArray(cdata.column, MapsLib.timeColumns) != -1);
                        if (isDate || isTime)
                        {
                            MapsLib.loadDatepickerFiles();
                            if ($.inArray(cdata.column, MapsLib.timeColumns) != -1)
                            {
                                dtype = "time";
                            }
                            else
                            {
                                dtype = "date";
                                fmin = MapsLib.getDateString(range.minVal);
                                fmindate = MapsLib.getDateString(range.minVal, true);
                                fmax = MapsLib.getDateString(range.maxVal);
                                fmaxdate = MapsLib.getDateString(range.maxVal, true);
                            }
                        }
                        if (fmin != undefined && fmax != undefined)
                        {
                            var isDisabled = (fmin == fmax);
                            html.push('<hr><div id="sc_' + safename + '" data-role="rangeslider">');
                            html.push("<label for='sc_min_" + safename + "'>" + cdata.label + ":</label>");
                            html.push("<input type='range' data-disabled='" + isDisabled + "' data-dtype='" + dtype + "' name='sc_min_" + safename + "' id='sc_min_" + safename + "' data-ref='column' data-field='" + 
                            cdata.column + "' data-compare='>=' value='" + fmin + "' data-value='" + fmindate + "' min='" + fmin + "' max='" + fmax + "' />");
                            html.push("<label for='sc_max_" + safename + "'>" + cdata.label + ":</label>");
                            html.push("<input type='range' data-disabled='" + isDisabled + "' data-dtype='" + dtype + "' name='sc_max_" + safename + "' id='sc_max_" + safename + "' data-ref='column' data-field='" + 
                            cdata.column + "' data-compare='<=' value='" + fmax + "' data-value='" + fmaxdate + "' min='" + fmin + "' max='" + fmax + "' />");
                            html.push('</div>');
                        }
                    }
                }
                break;

                case "dropdown":
                {
                    var field_id = MapsLib.safeField(cdata.label);
                    html.push("<hr><label for='sc_" + field_id + "'>" + cdata.label + ":</label>");
                    html.push("<select data-ref='custom' id='sc_" + field_id + "' name=''>");
                    var template = cdata.template;
                    var foreach = cdata.foreach;
                    var entries = cdata.entries;
                    if (typeof entries != 'undefined')
                    {    
                        for (var j = 0; j < entries.length; j++)
                        {
                            var option = entries[j];
                            if (option instanceof Array)
                            {
                                if (option.length > 1)
                                {
                                    var selected = (option.length > 2 && option[2] == true) ? ' selected="selected"' : "";
                                    html.push('<option value="' + option[1] + '"' + selected + ">" + option[0] + "</option>");
                                } 
                                else if (MapsLib.stringExists(template))
                                {
                                    html.push('<option value="' + template.replace(/{text}/g, option[0]) + '">' + option[0] + "</option>");
                                }
                            } 
                            else if (MapsLib.stringExists(template))
                            {
                                html.push('<option value="' + template.replace(/{text}/g, option) + '">' + option + "</option>");
                            }
                        }
                    }
                    if (MapsLib.stringExists(foreach))
                    {
                        var foreachSafe = "'" + foreach + "'";
                        MapsLib.in_query = "sc_" + field_id;
                        MapsLib.query(foreachSafe + ", Count()", "", "", foreachSafe, "MapsLib.updateSearchForeach");
                    }
                    html.push("</select>");
                }
                break;

                case "checkbox":
                {
                    var field_id = MapsLib.safeField(cdata.label);
                    var checked_tag = (cdata.is_checked == true) ? "checked" : "";
                    html.push('<input type="checkbox" data-ref="checkbox" id="sc_' + field_id + '" name="" data-checked="' + cdata.checked_query + '" data-unchecked="' + cdata.unchecked_query + '" ' + checked_tag + ' />');
                    html.push('<label for="sc_' + field_id + '">' + cdata.label + '</label>');
                }
                break;
            }
            
        });

        return html.join("");
    },
    // Generates search query according to generated HTML for Search section
    doSearch: function(firstSearch) {

        var whereClauses = [];
        if (firstSearch)
        {
            if (window.location.href.indexOf("#page-search") != -1)
            {
                // launched directly into the search page: hide search fields during setup
                $("#section-search").css("visibility", "hidden");
            }
            $("#section-search").html(MapsLib.searchHtml());

            $.each(MapsLib.searchPage.columns, function(i, cdata) {
                if (cdata.min)
                {
                    whereClauses.push("'" + cdata.column + "' >= '" + cdata.min + "'");
                }
                if (cdata.max)
                {
                    whereClauses.push("'" + cdata.column + "' <= '" + cdata.max + "'");
                }
                else if (cdata.min)
                {
                    // HACK: Fusion Tables SQL doesn't assume midnight as a time ceiling,
                    // so we have to make it explicit if a time floor was specified
                    if ($.inArray(cdata.column, MapsLib.timeColumns) != -1)
                    {
                        whereClauses.push("'" + cdata.column + "' <= '11:59 PM'");
                    }
                }
            });
        }

        MapsLib.clearSearch();

        //-----custom filters-------
        var address = $("#search_address").val();
        MapsLib.searchRadiusMeters = (firstSearch == true) ? 0 : $("#search_radius").val() * 1;

        $("input[data-ref='column']").each(function( index ) {
            var value = $(this).val();
            if (MapsLib.stringExists(value))
            {
                value = value.replace("'", "''"); // escape single quotes for SQL query
                var comparator = $(this).attr("data-compare");
                var name = $(this).attr("data-field");
                if (name in MapsLib.columnRanges)
                {
                    // skip if range is set to full range
                    var range = MapsLib.columnRanges[name];

                    // if settings override min/max, searches should not skip field on default
                    var forceMinCheck = false;
                    var forceMaxCheck = false;
                    MapsLib.searchPage.columns
                    $.each(MapsLib.searchPage.columns, function(i, cdata) {
                        if (cdata.column == name)
                        {
                            forceMinCheck = cdata.min;
                            forceMaxCheck = cdata.max;
                        }
                    });
                    if (!forceMinCheck && !forceMaxCheck)
                    {
                        if ($.inArray(name, MapsLib.dateColumns) != -1)
                        {
                            if ((comparator == "<" || comparator == "<=") && (value == MapsLib.getDateString(range.maxVal))) 
                                return true;
                            if ((comparator == ">" || comparator == ">=") && (value == MapsLib.getDateString(range.minVal))) 
                                return true;
                        }
                        else
                        {
                            if ((comparator == ">" || comparator == ">=") && (value == range.minVal)) 
                                return true;

                            
                            if ((comparator == "<" || comparator == "<=") && (value == range.maxVal))
                            {
                                // HACK: Fusion Tables SQL doesn't assume midnight as a time ceiling,
                                // so we have to make it explicit if a time floor was specified
                                if ($.inArray(name, MapsLib.timeColumns) != -1)
                                {
                                    var min_control = $("#sc_min_" + MapsLib.safeField(name));
                                    if (min_control && min_control.val() == range.minVal)
                                    {
                                        return true;
                                    }
                                }
                                else
                                { 
                                    return true;
                                }
                            }
                        }
                    }
                    // TODO: use equals operator if min and max set to same- this requires getting both values
                }
                whereClauses.push("'" + $(this).attr("data-field") + "' " + $(this).attr("data-compare") + " '" + value + "'");
            }
        });

        $("select[data-ref='custom']").each(function( index ) {
            var clause = $(this).find(":selected").val();
            if ((typeof clause != 'undefined') && clause.length > 0)
            {
                whereClauses.push(clause);
            }
        });

        $("input[data-ref='checkbox']").each(function( index ) {
            var clause = $(this).attr("data-checked");
            if ($(this).attr("checked") != "checked")
            {
                clause = $(this).attr("data-unchecked");
            }
            if ((clause != 'undefined') && (clause != ''))
            {
                whereClauses.push(clause);
            }
        });

        MapsLib.customSearchFilter = whereClauses.join(" AND ");
        var whereClause = MapsLib.safeLocationColumn + " NOT EQUAL TO ''";
        if (MapsLib.customSearchFilter.length > 0)
        {
            whereClause += " AND " + MapsLib.customSearchFilter;
        }
        //-------end of custom filters--------

        if (address != "" && address != undefined) {
            MapsLib.geocoder.geocode( {
                'address': address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    MapsLib.currentPinpoint = results[0].geometry.location;

                    MapsLib.map.setCenter(MapsLib.currentPinpoint);
                    MapsLib.map_centroid = MapsLib.currentPinpoint;
                    if (MapsLib.searchRadiusMeters > 0)
                    {
                        MapsLib.map.setZoom(MapsLib.zoomFromRadiusMeters(MapsLib.searchRadiusMeters));
                    }

                    MapsLib.safeShow(MapsLib.localMarker, false);
                    MapsLib.addrMarker = new google.maps.Marker({
                        position: MapsLib.currentPinpoint,
                        map: MapsLib.map,
                        icon: MapsLib.addrMarkerImage,
                        animation: google.maps.Animation.DROP,
                        title: address
                    });

                    if (MapsLib.stringExists(MapsLib.addressPinInfobox))
                    {
                        google.maps.event.addListener(MapsLib.addrMarker, 'click', function() {
                            MapsLib.infoWindow.setOptions({
                                content: '<div class="infobox-container">' + MapsLib.addressPinInfobox.replace("{address}", address.split(",")[0]) + '</div>',
                                position: MapsLib.currentPinpoint,
                                pixelOffset: new google.maps.Size(0, -32)
                            });
                            MapsLib.infoWindow.open(MapsLib.map);
                        });
                    }
                    if (MapsLib.searchPage.distanceFilter.filterSearchResults && MapsLib.searchRadiusMeters > 0)
                    {
                        whereClause += " AND ST_INTERSECTS(" + MapsLib.safeLocationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadiusMeters + "))";
                        MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
                    }
                    MapsLib.submitSearch(whereClause, MapsLib.map, MapsLib.currentPinpoint);
                } 
                else 
                {
                    alert("We could not find your address: " + status);
                }
            });
        } 
        else if ((MapsLib.searchPage.distanceFilter.entries.length > 0 || MapsLib.searchPage.addressShow) && (firstSearch == undefined || firstSearch == false) && MapsLib.map_centroid != undefined)
        {
            // search w/ current location
            MapsLib.currentPinpoint = MapsLib.map_centroid;
            MapsLib.safeShow(MapsLib.localMarker, true);
            MapsLib.safeShow(MapsLib.addrMarker, false);
            if (MapsLib.searchRadiusMeters > 0)
            {
                if (MapsLib.searchPage.distanceFilter.filterSearchResults)
                {
                    whereClause += " AND ST_INTERSECTS(" + MapsLib.safeLocationColumn + ", CIRCLE(LATLNG" + MapsLib.map_centroid.toString() + "," + MapsLib.searchRadiusMeters + "))";
                }
                MapsLib.map.setZoom(MapsLib.zoomFromRadiusMeters(MapsLib.searchRadiusMeters));
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
    safeField: function(val)
    {
        return (val == undefined) ? "" : val.replace(/ /g, "_").replace(/\./g, "").replace(/:/g, "").replace(/\?/g, "").replace(/#/g, "_").replace(/\$/g, "_");
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
        if (typeof isListView == 'undefined') 
            isListView = false;
        var safe_row = {}
        for (key in row)
        {
            var safekey = MapsLib.safeField(key);
            var safevalue = $(document.createElement('div')).html(row[key].value).text().replace(MapsLib.unicodeSet, ""); // using jQuery to decode "&amp;"->"&" and so on
            if (MapsLib.delimitedColumns != undefined && key in MapsLib.delimitedColumns)
            {
                // split value by delimiter
                if (safevalue.length == 0)
                {
                    safevalue = [];
                } 
                else
                {
                    safevalue = safevalue.split(MapsLib.delimitedColumns[key]);
                }
            }
            safe_row[safekey] = safevalue;
        }

        var infoboxContent = "";
        if (MapsLib.infoboxCompiled != null)
        {
            // using custom infobox
            var compiled = "";
            if (typeof MapsLib.customInfoboxHtml == "string")
            {
                compiled = MapsLib.infoboxCompiled({
                    isListView: isListView ? "true" : "",
                    row: safe_row
                });
            } 
            else
            {
                compiled = MapsLib.infoboxCompiled(safe_row, isListView);
            }
            infoboxContent = '<div class="infobox-container">' + compiled + '</div>';
        } 
        else if (isListView || MapsLib.customInfoboxHtml != "")
        {
            if ((typeof defaultContent != 'undefined' || defaultContent != undefined) &&
            defaultContent.indexOf("geometry:") == -1) // no geometry information in the infobox
            {
                infoboxContent = defaultContent;
            } 
            else
            {
                // Generate own infoboxContent, ignoring location column and empty values.
                infoboxContent = isListView ? '<div class="infobox-container">' : '<div class="googft-info-window">';
                infoboxContent += '<p class="infobox-default">';
                var limit = isListView ? 4 : 10; // limit number of lines in box
                var ix = 0;
                $.each(MapsLib.variantColumns, function(i, col) {
                    var val = safe_row[col];
                    if (val == null || val == "") 
                        return true;
                    if (col == MapsLib.locationColumn) 
                        return true;
                    if (col == "longitude") 
                        return true; // HACK: latitude implies there's also a longitude column
                    infoboxContent += "<b>" + col + ":</b> " + val + "<br/>";
                    if (++ix >= limit) 
                        return false;
                });
                infoboxContent += "</p></div>";
            }
        }
        return infoboxContent;
    },
    setLayerVisibility: function(layerOrder) {
        if (typeof layerOrder != 'undefined')
        {
            MapsLib.mapOverlayOrder = layerOrder;
        }
        MapsLib.searchrecords.setMap(null);
        $.each(MapsLib.mapOverlayLayers, function(i, layer)
        {
            layer.setMap(null);
        });
        $.each(MapsLib.mapOverlayOrder, function(i, index)
        {
            MapsLib.mapOverlayLayers[index].setMap(MapsLib.map);
        });
        MapsLib.searchrecords.setMap(MapsLib.map);
    },
    submitSearch: function(whereClause, map, location) {
        //get using all filters
        console.log("SQL Query: " + whereClause);

        MapsLib.searchrecords.setOptions({
          query: {
            from: MapsLib.fusionTableId,
            select: MapsLib.locationColumn,
            where: whereClause
          },
          styleId: MapsLib.styleId,
          templateId: MapsLib.templateId,
        });

        google.maps.event.clearListeners(MapsLib.searchrecords, 'click');
        google.maps.event.addListener(MapsLib.searchrecords, 'click', function(e) {

            // NOTE: Google's InfoWindow API currently provides no way to shorten the tail,
            // which is problematic when viewing on a mobile device in landscape mode

            if (typeof e == 'undefined' || e == null) 
                e = {};
            MapsLib.defaultPixelOffset = e.pixelOffset;
            MapsLib.infoWindow.setOptions({
                content: MapsLib.infoboxContent(e.row, false, e.infoWindowHtml),
                position: e.latLng,
                pixelOffset: e.pixelOffset
            });
            MapsLib.infoWindow.open(map);
        });
        
        MapsLib.setLayerVisibility(); // refresh layers
        MapsLib.overrideCenter = true;
    },
    clearSearch: function() {
        if (MapsLib.addrMarker != null)
            MapsLib.addrMarker.setMap(null);
        if (MapsLib.searchRadiusCircle != null)
            MapsLib.searchRadiusCircle.setMap(null);
        MapsLib.infoWindow.close();
        MapsLib.customSearchFilter = "";
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
            radius: MapsLib.searchRadiusMeters
        };
        MapsLib.searchRadiusCircle = new google.maps.Circle(circleOptions);
    },
    query: function(selectColumns, whereClause, orderClause, groupClause, callback) {
        var queryStr = [];
        queryStr.push("SELECT " + selectColumns);
        queryStr.push(" FROM " + MapsLib.fusionTableId);
        if (whereClause) {
            queryStr.push(" WHERE " + whereClause);
        }
        if (orderClause) {
            queryStr.push(" ORDER BY " + orderClause);
        }
        if (groupClause) {
            queryStr.push(" GROUP BY " + groupClause);
        }

        var sql = encodeURIComponent(queryStr.join(" "));
        var qstr = "https://www.googleapis.com/fusiontables/v1/query?sql=" + sql + "&callback=" + callback + "&key=" + MapsLib.googleApiKey;
        console.log("Query: " + qstr);
        $.ajax({
            url: qstr,
            dataType: "jsonp"
        });
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
    typesetRangeValue: function(inVal, column) {
        if (typeof inVal == 'string')
        {
            if (isNaN(inVal))
            {
                inVal = new Date(inVal);
            }
            else
            {
                inVal *= 1;
            }
        }
        return inVal;
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

        if (MapsLib.aboutPage == undefined && "description" in json && json.description.length > 0)
        {
            $("#section-about").html(json.description.replace(/\n/g, "<br/>"));
        }

        var all_columns = [];
        var num_columns = json["columns"].length;

        // Logic to determine which is the best location column if user hasn't specified it in settings:
        //   lat(itude) > geometry > addr(ess) > any other location column
        //   allow for contains-match (except for lat)
        var setLocation = (MapsLib.locationColumn == "");
        var locPriorites = {
            location: 1,
            addr: 3,
            geometry: 4,
            latitude: 2
        }; // higher value takes address priority
        var foundPriority = 0;
        var grabNextColumn = false;
        var secondType = "";
        for (var i = 0; i < num_columns; i++)
        {
            var name = json["columns"][i]["name"];
            var type = json["columns"][i]["type"];
            all_columns.push(name);
            if (grabNextColumn)
            {
                MapsLib.secondaryLocationColumn = name;
                secondType = type;
                grabNextColumn = false;
            }
            switch (type)
            {
            case "NUMBER":
                MapsLib.numericalColumns.push(name);
                break;

            case "DATETIME":
                if (name.toLowerCase().indexOf("time") != -1)
                {
                    MapsLib.timeColumns.push(name);
                }
                else if (name.toLowerCase().indexOf("hours") == -1)
                {
                    MapsLib.dateColumns.push(name);
                }
                break;

            case "LOCATION":
                if (setLocation)
                {
                    var lname = name.toLowerCase();
                    for (key in locPriorites)
                    {
                        var curPriority = locPriorites[key];
                        if ((lname == "lat") || // only exact-match for "lat"
                        (lname == key && curPriority >= foundPriority) || // exact-match overrides contains-match
                        (lname.indexOf(key) != -1 && curPriority > foundPriority)) // contains-match if higher priority
                        {
                            MapsLib.locationColumn = name;
                            foundPriority = curPriority;
                            grabNextColumn = true;
                            break;
                        }
                    }
                    if (foundPriority == 0)
                    {
                        // use this location column unless we find a higher-priority column
                        MapsLib.locationColumn = name;
                        grabNextColumn = true;
                    }
                }
                break;

            default:
                break;
            }
        }

        // wrap location column in single quotes
        MapsLib.safeLocationColumn = "'" + MapsLib.locationColumn + "'";
        MapsLib.safeLocationColumn = MapsLib.safeLocationColumn.replace(/''/g, "'");

        var customColumns = [];
        $.each(MapsLib.searchPage.columns, function(i, cdata) {
            customColumns.push(cdata.column);
        });
        MapsLib.columns = MapsLib.searchPage.allColumns ? all_columns : customColumns;
        MapsLib.doSearch(true);

        var columnRangeQueries = [];
        var whereClauses = [];
        var columnsToCheck = (MapsLib.searchPage.allColumns) ? MapsLib.all_columns : MapsLib.searchPage.columns;
        $.each(MapsLib.columns, function(i, column)
        {
            if (MapsLib.isStringColumn(column)) 
            {
                MapsLib.variantColumns.push(MapsLib.safeField(column));
                return true;
            }
            MapsLib.columnRanges[column] = {};
            var cIndex = $.inArray(column, customColumns);

            if ($.inArray(column, MapsLib.timeColumns) != -1)
            {
                MapsLib.columnRanges[column].minVal = "12:00 AM";
                MapsLib.columnRanges[column].maxVal = "11:59 PM";
                if (cIndex >= 0)
                {
                    if (MapsLib.searchPage.columns[cIndex].min)
                    {
                        MapsLib.columnRanges[column].minVal = MapsLib.searchPage.columns[cIndex].min;
                    }
                    if (MapsLib.searchPage.columns[cIndex].max)
                    {
                        MapsLib.columnRanges[column].maxVal = MapsLib.searchPage.columns[cIndex].max;
                    }
                }
                MapsLib.variantColumns.push(MapsLib.safeField(column));
                return true;
            }
            if (cIndex >= 0)
            {
                MapsLib.columnRanges[column].minVal = MapsLib.typesetRangeValue(MapsLib.searchPage.columns[cIndex].min, column);
                MapsLib.columnRanges[column].maxVal = MapsLib.typesetRangeValue(MapsLib.searchPage.columns[cIndex].max, column);
                    
                var getMin = (MapsLib.columnRanges[column].minVal == undefined);
                var getMax = (MapsLib.columnRanges[column].maxVal == undefined);
                if (getMin)
                {
                    columnRangeQueries.push("MINIMUM('" + column + "')");
                }
                if (getMax)
                {
                    columnRangeQueries.push("MAXIMUM('" + column + "')");
                }
                if (getMin || getMax)
                {
                    whereClauses.push("'" + column + "' NOT EQUAL TO ''");
                }
            } 
            else
            {
                columnRangeQueries.push("MINIMUM('" + column + "'), MAXIMUM('" + column + "')");
                whereClauses.push("'" + column + "' NOT EQUAL TO ''");
            }
        });

        // breaking up the MIN/MAX query to guard against URI's that are too long
        var i, j, subset, wheresubset, chunk = 8;
        MapsLib.outstandingQueries = 0;
        for (i = 0, j = columnRangeQueries.length; i < j; i += chunk) {
            MapsLib.outstandingQueries += 1;
            subset = columnRangeQueries.slice(i, i + chunk);
            wheresubset = whereClauses.slice(i, i + chunk);
            var sql = encodeURIComponent("SELECT " + subset.join(", ") + " FROM " + MapsLib.fusionTableId + " WHERE " + wheresubset.join(" AND "));
            var qstr = "https://www.googleapis.com/fusiontables/v1/query?sql=" + sql + "&callback=MapsLib.sliderMinMaxResult&key=" + MapsLib.googleApiKey;
            console.log("Query: " + qstr);
            $.ajax({
                url: qstr,
                dataType: "jsonp"
            });
        }

        if (columnRangeQueries.length == 0)
        {
            $("#section-search").html(MapsLib.searchHtml());
            MapsLib.initSearchFieldCallbacks();
        }
    },
    getListView: function() {
        MapsLib.listViewRows = [];
        MapsLib.updateListView();
    },
    updateListView: function() {
        var whereClause = MapsLib.safeLocationColumn + " NOT EQUAL TO ''";
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
        else if (MapsLib.searchRadiusMeters > 0 && MapsLib.searchPage.distanceFilter.filterListResults)
        {
            whereClause += " AND ST_INTERSECTS(" + MapsLib.safeLocationColumn + ", CIRCLE(LATLNG" + centerPoint.toString() + "," + MapsLib.searchRadiusMeters + "))";
            if (MapsLib.listViewSortByColumn)
            {
                whereClause += " ORDER BY " + MapsLib.listViewSortByColumn;
            }
            whereClause += limitClause;
        } 
        else
        {
            // FusionTable query limitation: There can at most be one spatial condition or "order by distance" condition.  We can't do both.
            orderClause = MapsLib.listViewSortByColumn || "ST_DISTANCE(" + MapsLib.safeLocationColumn + ", LATLNG" + centerPoint.toString() + ")";
            orderClause += limitClause;
        }

        if (MapsLib.listViewRows.length == 0)
        {
            $("ul#listview").html('<li data-corners="false" data-shadow="false" data-iconshadow="true" data-theme="d">Loading results...</li>');
        }
        if (!MapsLib.in_query) MapsLib.in_query = true;
        MapsLib.query("*", whereClause, orderClause, "", "MapsLib.displayListView");
    },
    updateSearchForeach: function(json) {
        var selectObject = $("#" + MapsLib.in_query);
        MapsLib.in_query = false;
        if (MapsLib.handleError(json)) {
            return false;
        }
        // add distinct rows to search dropdown
        var numRows = (json != undefined && json.rows != undefined) ? json.rows.length : 0;
        var column = json.columns[0];
        for (var ix = 0; ix < numRows; ix++) {
            var rowname = json.rows[ix][0];
            var whereclause = "'" + column + "' = '" + rowname + "'";
            var row = $("<option></option>").attr("value", whereclause).text(rowname);
            selectObject.append(row);
        }
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
        for (var ix = existingRows; ix < numRows; ix++) {
            // make row object.
            var row = {};
            for (var jx = 0; jx < json.columns.length; jx++) {
                row[ json.columns[jx] ] = {
                    "value" : json.rows[ix][jx]
                };
            }
            MapsLib.listViewRows.push(row);

            var row_html = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="d" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-up-d"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a href="#page-map" id="listrow-' + ix + '" data-transition="slidedown" class="ui-link-inherit">';
            row_html += MapsLib.infoboxContent(row, true);
            row_html += '</a></div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span></div></li>';

            $("ul#listview").append(row_html);

            $("a#listrow-" + ix).click(function(e) {
                var index = e.currentTarget.id.split("-")[1] * 1;
                MapsLib.selectedListRow = MapsLib.listViewRows[index];


                if (MapsLib.selectedListRow != undefined)
                {
                    MapsLib.infoWindow.close();
                    var row = MapsLib.selectedListRow;
                    var options = {
                        content: MapsLib.infoboxContent(row, false) 
                    };
                    if (MapsLib.locationColumn.toLowerCase().indexOf("latitude") != -1 || MapsLib.locationColumn.toLowerCase() == "lat")
                    {
                        MapsLib.queueInfobox = new google.maps.LatLng(row[MapsLib.locationColumn].value, row[MapsLib.secondaryLocationColumn].value);
                        options["position"] = MapsLib.queueInfobox;
                        options["pixelOffset"] = MapsLib.defaultPixelOffset;
                        MapsLib.infoWindow.setOptions(options);
                    } 
                    else if (MapsLib.locationColumn.toLowerCase().indexOf("geometry") != -1)
                    {
                        // There's a number of ways to get lng/lat from a geo (can be a point, a line, a polygon).
                        var geo = row[MapsLib.locationColumn].value;
                        var lnglat = ("geometries" in geo) ? geo.geometries[0].coordinates : geo.geometry.coordinates;
                        var parent = lnglat;
                        while (lnglat[0] instanceof Array)
                        {
                            parent = lnglat;
                            lnglat = lnglat[0];
                        }
                        if (parent[0] instanceof Array)
                        {
                            // has mutiple points, get center of line/polygon
                            var latsum = 0;
                            var lngsum = 0;
                            $.each(parent, function(i, coord)
                            {
                                latsum += coord[1];
                                lngsum += coord[0];
                            });
                            MapsLib.queueInfobox = new google.maps.LatLng(latsum / parent.length, lngsum / parent.length);
                        } 
                        else
                        {
                            MapsLib.queueInfobox = new google.maps.LatLng(lnglat[1], lnglat[0]);
                        }
                        options["position"] = MapsLib.queueInfobox;
                        MapsLib.infoWindow.setOptions(options);
                    } 
                    else
                    {
                        // assuming that locationColumn is an address
                        var address = row[MapsLib.locationColumn].value;
                        MapsLib.queueInfobox = true;
                        MapsLib.geocoder.geocode( {
                            'address': address
                        }, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                var thispos = results[0].geometry.location;
                                MapsLib.queueInfobox = new google.maps.LatLng(thispos.lat(), thispos.lng());
                                MapsLib.infoWindow.setOptions({
                                    content: MapsLib.infoboxContent(MapsLib.selectedListRow, false),
                                    position: MapsLib.queueInfobox,
                                    pixelOffset: MapsLib.defaultPixelOffset
                                });
                            }
                        });
                    }
                    MapsLib.onEnterMap();
                }
            });
        }
    },
    //converts a slug or query string in to readable text
    convertToPlainString: function(text) {
        if (text == undefined) 
            return '';
        return decodeURIComponent(text);
    }

    //-----custom functions------------------------------------------------------
    // NOTE: if you add custom functions, make sure to append each one with a 
    // comma, except for the last one.
    // This also applies to the convertToPlainString function above
    //-----end of custom functions-----------------------------------------------
});

