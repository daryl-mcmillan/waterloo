void (function() {

	function getDeepChild( parent, childKeys ) {
		var result = parent;
		for( var i=0; i<childKeys.length; i++ ) {
			if( !result ) {
				return result;
			}
			result = result[childKeys[i]];
		}
		return result;
	}

	function visitDocAddress( addAddress ) {
		var addrElement = document.querySelector("#m_property_dtl_address");
		if( addrElement ) {
			addAddress( addrElement.innerText, document.location.href );
		}
	}

	function visitFormAddresses( addAddress ) {
		var framedoc = getDeepChild( window, ['frames',0,'document'] );
		var viewwindow = getDeepChild( window, ['frames',1] );
		if( framedoc && viewwindow ) {
			var selected = framedoc.querySelector("select[name=RecordIDList] option:checked");
			if( selected ) {
				var address = selected.innerText;
				var form = framedoc.querySelector("form[name=formGetEmailView]");
				var url = form.action;
				url += "?&RecordIDList=" + encodeURIComponent( selected.value );
				var inputs = form.querySelectorAll( "input" );
				for( var i=0; i<inputs.length; i++ ) {
					if( !inputs[i] ) {
						continue;
					}
					url += "&" + inputs[i].name + "=" + encodeURIComponent( inputs[i].value );
				}
				addAddress( address, url );
			}
		}
	}

	var scriptTag = document.currentScript || document.body.lastElementChild;
	var scriptSrc = scriptTag.src;
	scriptSrc = scriptSrc.split('#')[0];
	scriptSrc = scriptSrc.split('?')[0];
	var parts = scriptSrc.split('/');
	parts.pop();
	var controllerSrc = parts.join('/') + '/index.html';
	var frame = document.createElement("iframe");
	frame.src = controllerSrc;
	frame.onload = function() {
		var addAddress = function( address, link ) {
			console.log( address, link );
			frame.contentWindow.postMessage({
				id: address,
				address: address,
				link: link
			}, "*" );
		};
		visitDocAddress( addAddress );
		visitFormAddresses( addAddress );
	};
	document.body.appendChild( frame );
})();