var map = new L.Map('map', {
  zoom: 15,
  fullscreenControl: true,
  center: [39.7, -82.8],
});

var OpenStreetMap_BlackAndWhite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
});


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

//Define style & Load Appalachian Counties outline
var appalachia = L.geoJson(null, {
    style: {
      color: '#f00',
      weight: 3,
      opacity: 1,
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
      fillColor: "#75EDFE",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  },
  onEachFeature: function(feature, layer) {
    //feature.properties && feature.properties.Title && feature.properties.Location
    if (feature.properties.filename) {
      feature.properties.id = x;
      x = x+1;
      console.log('getting info');
      var image = feature.properties.filename;
      var imageUrl = encodeURI(image);
      console.log(imageUrl);
      var url = "images/compressed/" + imageUrl;
      //console.log(url);
      var layerx = layer.getLatLng().Latitude;
      var layery = layer.getLatLng().Longitude;
      var name = feature.properties.Name;
      var id = feature.properties.id;
      console.log(id);
      layer.bindPopup('<img src="' + url + '" style="width:300px;padding:10px 0;"><br/><h4>' + name + '</h4>' + feature.properties.Message + '<br /><span id = "directions"><a href="https://www.google.com/maps/dir//?saddr=My+Location' + '&daddr=' + layerx + ',' + layery + '" target="_blank">Directions</a></span></a></li>',
       {
        minWidth: 310,
        maxHeight: 280,
      });
      //var id = feature.properties.ID;
      var title = feature.properties.Name;
      //console.log(id);
      $("#content-6").mThumbnailScroller({
        type: "click-25",
        /*change to "y" for vertical scroller*/
      });
      $("#mTS_1_container").append('<li class="mTSThumbContainer"><a id ="' + id + '" class="mural-img" href="' + '#' + '"><img src="' + url + '" title="' + name + '" height=166px class="mTSThumb" />');
    }
  }
});
var muralCluster = new L.markerClusterGroup({
  disableClusteringAtZoom: 14,
  zoomToBoundsOnClick: true,
  spiderfyOnMaxZoom: false,
}).addTo(map);

//CSV LOAD- Features via omnivore and add them to the mural layer
var muraldata = omnivore.csv('murals.csv', null, muralLayer);

//Wait for the data to be loaded before doing a few other things.
muraldata.on('ready', function() {
  setTimeout(function() {
    $("#loader").fadeOut();
  },2000);
  console.log(muraldata);
  map.fitBounds(muralLayer.getBounds(), {maxZoom: 8});
  muralCluster.addLayer(muralLayer);
  muralCluster.on('clusterclick', function(e) {
    console.log(e);
    map.flyTo(e.layer.getLatLng(), 15, {duration: 2})
  });
  console.log('mural data ready');
  console.log(muralLayer);
  //assign a click event to the mural images
  $(".mural-img").click(function() {
    map.closePopup();
    var clickID = "";
    clickID = $(this).prop('id');
    console.log(clickID);
    muralLayer.eachLayer(function(layer) {
      if ((layer.feature.properties.id) == clickID) {
        map.flyTo(layer.getLatLng(), 15);
        var click = 1;
        map.on('moveend', function() {
          if (click === 1) {
            layer.openPopup();
          }
        });
        layer.on('popupopen', function() {
          click = 2
        });
      }
    });
    click = 2;
  });
});
