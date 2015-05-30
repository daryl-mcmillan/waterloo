var mapNode = document.querySelector("#map");

var geocoder = new google.maps.Geocoder();

var center = new google.maps.LatLng(43.4583963,-80.5465509);
var searchBounds = new google.maps.LatLngBounds(
	new google.maps.LatLng(center.lat()-0.4,center.lng()-0.4),
	new google.maps.LatLng(center.lat()+0.4,center.lng()+0.4)
);
var mapOptions = { zoom: 12, center: center };
var map = new google.maps.Map(mapNode, mapOptions);
var marker = new google.maps.Marker({
	map: map,
	position: center
});

layers = {};

function addLayer( name, src, color ) {
  var layer = new google.maps.Data();
  layer.loadGeoJson(src);
  layer.setStyle({
    strokeColor : color,
    icon : {
      path: google.maps.SymbolPath.CIRCLE,
      strokeColor: color,
      fillColor: color,
      fillOpacity: 1.0,
      scale: 2
    }
  });
  layer.setMap(map);
  var label = document.createElement("label");
  label.appendChild( document.createTextNode( name + ":" ) );
  var toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = true;
  toggle.onchange = function() {
    if( toggle.checked ) {
      layer.setMap(map);
    } else {
      layer.setMap(null);
    }
  };
  label.appendChild(toggle);
  var parent = document.getElementById("toggles");
  parent.appendChild( label );
  layers[name] = layer;
  google.maps.event.addListener(layer, 'mouseover', function( e ) {
    var title = e.feature.getProperty("name") || "??";
    $("#info").text(title);
  });
  google.maps.event.addListener(layer, 'mouseout', function( x ) {
    $("#info").text("");
  });
}

addLayer( 'power', 'data/power.json', 'red' );
addLayer( 'trains', 'data/trains.json', 'blue' );
addLayer( 'schools', 'data/schools.json', 'green' );
addLayer( 'groceries', 'data/groceries.json', '#099' );

function showAddress( address ) {
  console.log( { address: address } );
  var search = { address: address, bounds: searchBounds };
	geocoder.geocode( search, function( results, status ) {
		if( status != google.maps.GeocoderStatus.OK ) {
			console.log( "geocode error", status );
			return;
		}
		var coords = results[0].geometry.location;
		var title = results[0].formatted_address;
		console.log( results[0] );
		marker.setPosition(coords);
		marker.setTitle(title);
		map.setCenter(coords);
	});
}

var addr = document.getElementById("addr");
var presses = 0;
addr.onkeypress = function() {
  presses ++;
  setTimeout( function() {
    presses--;
    if( presses === 0 ) {
      showAddress( addr.value );
    }
  }, 500);
};

function showHash() {
	var hash = document.location.hash.slice( 1 );
	var address = decodeURIComponent(hash);
	addr.value = address;
	showAddress( address );
}
window.onhashchange = showHash;
showHash();