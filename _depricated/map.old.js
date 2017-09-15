var map = new L.Map('map', {
  zoom: 8,
  fullscreenControl: true,
  center: [39.3, -82.3],
  minZoom: 7,
  maxBounds: [[45.84, -90.38],[35.02,-74.73]],
});

/* OSM  B&W Basemap no longer used NK update 8-9-17
var OpenStreetMap_BlackAndWhite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
});
*/

var layerx,layery;

var cdblight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 22,
  maxNativeZoom: 18,
}).addTo(map);

var esrigray = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxNativeZoom: 16,
  maxZoom: 19,
});

var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri',
  /*maxNativeZoom: 14,*/
  maxZoom: 22
});

var labels = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxNativeZoom: 18,
  maxZoom: 22,
  opacity: 0.9,
});

//Define style & Load Appalachian Counties outline
var appalachia = L.geoJson(null, {
    style: {
      color: '#D2B48C',
      weight: 3,
      opacity: 0.5,
      fillOpacity: 0.1,
      interactive: false,
      dashArray: "5, 8",
    }
}).addTo(map);

var appalachiaData = omnivore.geojson("Ohio_Appalachian_Region.geojson",null, appalachia);

/*Load with AJAX Plugin*/
/*var appalachiaData2 = new L.geoJSON.ajax("Ohio_Appalachian_Region.geojson", {
  style: {
    color: "purple",
  }
})
.addTo(map);
*/
var x = 0;
//GeoJson layer to hold the csv data
var muralLayer = new L.geoJson(null, {
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor:"#DC143C",
      color: "#000",
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.8
    });
  },
  onEachFeature: function(feature, layer) {
    /*feature.properties && feature.properties.Title && feature.properties.Location*/
    if (feature.properties.filename) {
//      feature.properties.id = x;
//      x = x+1;
/*console.log('getting info');*/
      var image = feature.properties.filename;
      var imageUrl = encodeURI(image);
      /*console.log(imageUrl);*/
      var url = "images/compressed/" + imageUrl;
      /*console.log(url);*/
      var thumbUrl = "images/thumbnails/" + imageUrl;
      var name = feature.properties.Name;
      var id = feature.properties.fileid;
      var lat = feature.geometry.coordinates[1];
      var lng = feature.geometry.coordinates[0];
      var imageLink = feature.properties.Link;
    /*  console.log(id); */
      layer.bindPopup('<a href="' + imageLink + '" target="_blank"><img src="' + url + '" style="width:300px;padding:10px 0;"></a><br/><h4>' + name + '</h4>' + feature.properties.Message + '<br /><span id = "directions"><a href="https://www.google.com/maps/dir//?saddr=My+Location' + '&daddr=' + lat + ',' + lng + '" target="_blank">Directions</a></span></a></li>',
       {
        minWidth: 310,
        maxHeight: 280,
      });
      //var id = feature.properties.ID;
      var title = feature.properties.Name;
      //console.log(id);
      $("#content-6").mThumbnailScroller({
        type: "click-25",
        callbacks:{
            onScroll:function(){
              console.log("scroll completed");
            }
        },
        /*change to "y" for vertical scroller*/
      });
      $("#mTS_1_container").append('<li class="mTSThumbContainer"><a id ="' + id + '" class="mural-img" href="' + '#' + '"><img src="' + thumbUrl + '" title="' + name + '" height=166px class="mTSThumb" />');
    }
  }
});

var muralCluster = new L.markerClusterGroup({
  disableClusteringAtZoom: 13,
  zoomToBoundsOnClick: true,
  spiderfyOnMaxZoom: false,
  maxClusterRadius: 60
}).addTo(map);

/*CSV LOAD- Features via omnivore and add them to the mural layer*/
var muraldata = omnivore.csv('murals.csv', null, muralLayer);

/*scroll to image when mural point is clicked*/
muralLayer.on('click', function(e) {
  console.log(e);
  $(".mural-img").removeClass('active');
  var muralid = e.layer.feature.properties.id;
  $("#content-6").mThumbnailScroller("scrollTo", "#" + muralid, {
    easing: "easeInOutStrong",
    speed: 1000,
    callbacks: true
  });
  setTimeout(function() {
    $("#" + muralid).addClass('active');
  }, 100);
});

/*Wait for the data to be loaded before doing a few other things.*/
muraldata.on('ready', function() {
  console.log(muraldata);
  setTimeout(function() {
    $("#loader").fadeOut();
  },2000);
  //muralLayer.addTo(map);
  console.log('mural data ready');
  /*console.log(muralLayer);
  console.log(muraldata);*/
  /*map.fitBounds(muralLayer.getBounds(), {maxZoom: 8});*/
  //muralCluster.addLayer(muralLayer);
  muralCluster.on('clusterclick', function(e) {
    console.log(e);
    map.flyTo(e.layer.getLatLng(), 14, {duration: 2})
  });
  /*assign a click event to the mural images*/
  $(".mural-img").click(function() {
    $(".mural-img").removeClass('active');
    map.closePopup();
    var clickID = "";
    clickID = $(this).prop('id');

    console.log(clickID);

    muralLayer.eachLayer(function(layer) {
      if ((layer.feature.properties.fileid) == clickID) {
        map.flyTo(layer.getLatLng(), 15);
        var click = 1;
        map.on('moveend', function() {
          if (click === 1) {
            layer.openPopup();
          }
        });
        layer.on('popupopen', function() {
          click = 2
          $("#" + clickID).addClass('active');
        });
      }
    });
    click = 2;
  });
});

/*clear active from all mural images on map click or popup close*/
map.on('click', function() {
  $('.mural-img').removeClass('active')
});

map.on('popupclose', function() {
  $('.mural-img').removeClass('active')
});

/*change basemap' to aerial beyond certain zoom*/
map.on('zoom',function() {
  var currentZoom = map.getZoom();
  if (currentZoom > 13 ) {
    map.removeLayer(cdblight);
    esri.addTo(map);
    labels.addTo(map);
  }
  if (currentZoom < 14) {
    map.removeLayer(esri);
    map.removeLayer(labels);
    cdblight.addTo(map);
  }
});

/*tabletop loader from the google script form*/
var muralPoints = new L.geoJson().addTo(map);

buildMap();

function buildMap() {
  console.log('building map');
  muralPoints.clearLayers();

  var tabletop = Tabletop.init({
    key: '1VGIfezGZ9cOkPpf5ep5ZG8rvKZs8x2xIYCJJWVDP-bE',
    simpleSheet: true,
    //parseNumbers: true,
    callback: function(data, tabletop) {
      console.log(data);
      //create a geojson out of the raw data with geojson.min
      var muralPointData = GeoJSON.parse(data, {Point: ['Latitude', 'Longitude']});
      console.log(muralPointData);
      var points = new L.geoJson(muralPointData, {
        pointToLayer: function(feature, latlng) {
          return new L.circleMarker(latlng, {
            radius: 8,
            fillColor:"#DC143C",
            color: "#000",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
        onEachFeature: function(feature, layer) {
            var popup = "<iframe src='https://drive.google.com/file/d/" + layer.feature.properties.fileid +"/preview' width='320' height='240' frameborder='0'></iframe> \
            <br /><h5>" + layer.feature.properties.Name + "</h5>" + layer.feature.properties.Message;
            layer.bindPopup(popup, {
              minWidth:320
            });
        }
    });
    //muralPoints.addLayer(points);
    points.on('click', function(e) {
      console.log(e);
      $(".mural-img").removeClass('active');
      var muralid = e.layer.feature.properties.fileid;
      $("#content-6").mThumbnailScroller("scrollTo", "#" + muralid, {
        easing: "easeInOutStrong",
        speed: 1000,
        callbacks: true
      });
      setTimeout(function() {
        $("#" + muralid).addClass('active');
      }, 100);
    });
    muralCluster.addLayer(points);

    $("#fileWarning").html('');
   }
  });
}

/*Checks lat/long on map
map.on('click',function(e){
  alert("Lat:" + e.latlng.lat + "long:" + e.latlng.lng)
});
*/
