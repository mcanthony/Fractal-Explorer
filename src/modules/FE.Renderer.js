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

			$activeCanvas = document.getElementById(FE.Settings.renderer.toLowerCase());
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
			var isBuddha = ~S.fractal.indexOf("Buddhabrot");

			S.resolution._factor = 0.05;
			!opts.preview && FE.Gui.update();

			if (!isBuddha) {
				FE.Renderer.pending = true;
				renderer.render();
				FE.Renderer.pending = false;
			}

			// Stop rendering when there is a zoom request
			if (FE.View.requestZoom) {
				var dz = FE.View.requestZoom;
				delete FE.View.requestZoom;
				return FE.View.zoom.call(FE.View.zoom, dz);
			}

			window.clearTimeout(render.timeout);

				render.timeout = window.setTimeout(function() {

				S.resolution._factor = S.resolution.factor;

				FE.Renderer.pending = true;
				renderer.render();
				FE.Renderer.pending = false;
				
			}, 100);
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

			var C = document.querySelector("canvas.active");
			var W = window.innerWidth;
			var H = window.innerHeight;
			var D = window.parseInt(C.style.width,10);

			if (~FE.Settings.fractal.indexOf("Buddhabrot"))
			{ return FE.View.changeMode("center",D,D); }

			// Update canvas size
			C.width = ~~(W * FE.Settings.resolution._factor);
			C.height = ~~(H * FE.Settings.resolution._factor);

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