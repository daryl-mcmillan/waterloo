void (function() {

	function getAddress() {
		var addrElement = document.querySelector("#m_property_dtl_address");
		if( addrElement ) {
			return addrElement.innerText;
		}
		if( window.frames && window.frames[0] && window.frames[0].document ) {
			var doc = window.frames[0].document;
			var selected = doc.querySelector("select[name=RecordIDList] option:checked");
			if( selected ) {
				return selected.innerText;
			}
		}
		return null;
	}

	var address = getAddress();
	if( address ) {
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
			frame.contentWindow.postMessage({
				id: address,
				address: address,
				link: document.location.href
			}, "*" );
		}; 
		document.body.appendChild( frame );
	} else {
		console.log("no address found");
	}
})();