;(function(FE, window, undefined) {

	"use strict";

	FE.Utils = {}
	
	FE.Utils.merge = function m(a, b) {
		
		for (var p in b) {
			try {
				if (b[p].constructor == Object)
				{ a[p] = m(a[p], b[p]); }
				else { a[p] = b[p]; }
			} catch(e) { a[p] = b[p]; }
		}

		return a;
	};

}(window.FE || {}, window));