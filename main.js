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
marker.setTitle( "Waterloo" );
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

function resolveAddress( address, func ) {
  if( !address ) {
    return;
  }
  console.log( { address: address } );
  var search = { address: address, bounds: searchBounds };
	geocoder.geocode( search, function( results, status ) {
		if( status != google.maps.GeocoderStatus.OK ) {
			console.log( "geocode error", status );
			return;
		}
		var coords = results[0].geometry.location;
		var address = results[0].formatted_address;
		func({
			coords: { lat: coords.lat(), lng: coords.lng() },
			address: address
		});
	});
}

function showAddress( address ) {
	resolveAddress( address, function( item ) {
		console.log( item );
		marker.setPosition(item.coords);
		marker.setTitle(item.address);
		map.setCenter(item.coords);
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

var localStorageMarkers = [];
function showLocalStorageItem( item ) {
	var marker = new google.maps.Marker({
		map: map,
		position: item.resolved.coords
	});
	marker.setTitle( item.resolved.address );
	google.maps.event.addListener(marker, 'click', function() {
		window.open(item.link, "mapDetails");
	});
	localStorageMarkers.push( marker );
}
function addLocalStorageItemToMap( key ) {
	var item = JSON.parse(localStorage[key]);
	console.log( item.address );
	if( !item.resolved ) {
		resolveAddress( item.address, function( info ) {
			item.resolved = info;
			localStorage.setItem( key, JSON.stringify(item) );
			showLocalStorageItem( item );
		});
	} else {
		showLocalStorageItem( item );
	}
}

function addLocalStorageItems() {
	for( var i=0; i<localStorageMarkers.length; i++ ) {
		localStorageMarkers[i].setMap(null);
	}
	localStorageMarkers = [];
	var items = [];
	for( var key in localStorage ) {
		if( !key.startsWith( "mapItem-" ) ) {
			continue;
		}
		addLocalStorageItemToMap( key );
	}
}
addLocalStorageItems();
window.addEventListener( "storage", addLocalStorageItems, false );
