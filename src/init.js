;(function(window, undefined) {

	var FE = {};

	FE.init = function() {
		
		Object.keys(FE).forEach(function(module) {
			if (typeof FE[module].init == "function") {
				FE[module].init();
			}
		});
	};

	window.FE = FE;

}(window));