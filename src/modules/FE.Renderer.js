;(function(FE, window, undefined) {

	"use strict";

	FE.Renderer = (function() {

		var renderer, $canvas, $webgl, $activeCanvas;

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init() {

			$canvas = document.getElementById("canvas");
			$webgl = document.getElementById("webgl");

			$activeCanvas = document.getElementById(FE.Settings.renderer.toLowerCase())
			$activeCanvas.className = "active";

			window.addEventListener("resize", resize);
			set(FE.Settings.renderer, true);
		}

		/* ==================== */
		/* ====== RENDER ====== */
		/* ==================== */

		function render(opts) {

			opts = opts || {};

			var S = FE.Settings;
			var isBuddha = S.fractal.indexOf("Buddhabrot") != -1;
			var renderFN = renderer["render" + S.fractal];

			// Renderer not available
			if (!renderFN) { return alert(S.renderer + " renderer not yet available for " + S.fractal); }

			// Reset factor and update gui
			if (!render.init && !FE.Renderer.pending) {

				S.resolution._factor = isBuddha ? S.resolution.factor : S.resolution.factor/S.resolution.steps;
				render.init = true;

				!opts.preview && FE.Gui.update();
			}

			FE.Renderer.pending = true;
			renderFN();
			FE.Renderer.pending = false;

			// Stop rendering when there is a zoom request
			if (FE.View.requestZoom) {
				var dz = FE.View.requestZoom;
				delete FE.View.requestZoom;
				return FE.View.zoom.call(FE.View.zoom, dz);
			}

			// Increase resolution and render again until max res is reached
			if (S.resolution._factor < S.resolution.factor && !opts.preview && !FE.View.requestDrag && !isBuddha) {

				S.resolution._factor = Math.min(S.resolution.factor, S.resolution._factor + S.resolution.factor/S.resolution.steps);
				window.setTimeout(render,1);

			} else { render.init = false; }
		}

		/* ================= */
		/* ====== SET ====== */
		/* ================= */

		function set(which, init) {

			if (which == "WebGL" && !window.WebGLRenderingContext) {

				alert(
					"Your browser does not support WebGL.\n"+
					"The canvas renderer will be used instead."
				);

				which = "Canvas";
			}

			FE.Settings.renderer = which;
			renderer = FE[which + "Renderer"];

			// Reset canvas styles
			$webgl.style.display = $canvas.style.display = "none";
			$webgl.className = $canvas.className = "";

			// Find render canvas and set as active
			var $activeCanvas = document.getElementById(which.toLowerCase());
			$activeCanvas.style.display = "block";
			$activeCanvas.className ="active";

			FE.Renderer.canvas = $activeCanvas;

			if (init && !FE.Gui.readURL()) { FE.Presets.load("None"); }
			else { render(); }
		}

		/* ==================== */
		/* ====== RESIZE ====== */
		/* ==================== */

		function resize() {

			var canvas = document.querySelector("canvas.active");
			var W = window.innerWidth;
			var H = window.innerHeight;

			// Update canvas size
			canvas.width = ~~(W * FE.Settings.resolution._factor);
			canvas.height = ~~(H * FE.Settings.resolution._factor);

			// Update webgl viewport
			if (FE.Settings.renderer == "WebGL")
			{ FE.WebGLRenderer.getContext().viewport(0, 0, W, H); }

			// Render preview until resize is finished
			render({ preview: true });
			if (resize.interval) { return; }

			// Check for resize finish
			resize.interval = window.setInterval(function() {

				if (resize.oldSize == W+H) {

					window.clearInterval(resize.interval);
					delete resize.interval; render();

				} else { resize.oldSize = W+H; }

			}, 100);
		}

		return {
			init: init,
			render: render,
			set: set
		};

	}());

}(window.FE || {}, window));