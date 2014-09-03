;(function(window, undefined) {

	var FE = {};

	FE.init = function() {

		var S = FE.Settings;

		Object.keys(FE).forEach(function(module) {
			if (typeof FE[module].init == "function") {
				FE[module].init();
			}
		});

		FE.Renderer.set(FE.Settings.renderer);
	};

	window.FE = FE;

}(window));