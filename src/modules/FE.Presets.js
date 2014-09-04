;(function(FE, window, undefined) {

	"use strict";

	FE.Presets = (function() {

		var presets = {

			Mandelbrot: {
				"None": [0,0,4,100,0.3],
				"Spiral": [0.0016437220301664297,-0.8224676331635277,1e-8,200,0.3],
				"Shell": [0.2786942955010296,0.007944220897414945,0.001953125,300,0.3],
				"Mandelsun": [-1.7451606879398844,-9.383515877032168e-12,2.9802322387695312e-8,600,0.05]
			},

			Buddhabrot: {
				"None": [0,0,4,50,0.3]
			},
			
			Julia: {
				"None": [0,0,4,100,0.3,0.34288121314237574,0.0455005055611728]
			}
		};

		/* ================== */
		/* ====== LOAD ====== */
		/* ================== */

		function load(preset) {

			var S = FE.Settings;
			var p = presets[S.fractal][preset];

			if (!p) { return; }

			S.coordinates.x = p[0]
			S.coordinates.y = p[1];
			S.coordinates.z = p[2];
			
			S.resolution.iterations = p[3];
			S.shading.scale = p[4];

			if (S.fractal == "Julia") {
				S.position.x = p[5];
				S.position.y = p[6];
			}

			FE.Gui.update();
			FE.Renderer.render();
		}

		return {
			load: load,
			presets: presets
		};

	}());

}(window.FE || {}, window));