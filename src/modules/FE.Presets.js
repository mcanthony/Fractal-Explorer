;(function(FE, window, undefined) {

	"use strict";

	FE.Presets = (function() {

		var presets = {

			Mandelbrot: {
				"None": [0,0,4,100,0.3],
				"Spiral": [0.0016437220301664297,-0.8224676331635277,1e-8,200,0.3],
				"Shell": [0.2786942955010296,0.007944220897414945,0.001953125,500,0.3],
				"Mandelsun": [-1.7451606879398844,-9.383515877032168e-12,2.9802322387695312e-8,1000,0.05]
			},

			Buddhabrot: {
				"None": [0,0,4,50,0]
			},
			
			Julia: {
				"None": [0,0,4,100,0.3]
			}
		};

		/* ================== */
		/* ====== LOAD ====== */
		/* ================== */

		function load(preset) {

			var S = FE.Settings;
			var p = presets[S.fractal][preset];

			if (!p) { return; }

			S.coordinates = { x: p[0], y:p[1], z: p[2] };
			S.iterations = p[3];
			S.shading.scale = p[4];

			FE.Gui.update();
			FE.Renderer.render();
		}

		return {
			load: load,
			presets: presets
		};

	}());

}(window.FE || {}, window));