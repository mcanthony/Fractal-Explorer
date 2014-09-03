;(function(FE, window, undefined) {

	"use strict";

	FE.Renderer = (function() {

		var renderer;
		var $canvas;
		var $webgl;

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init() {

			$canvas = document.getElementById("canvas");
			$webgl = document.getElementById("webgl");

			document.getElementById(FE.Settings.renderer.toLowerCase()).className = "active";
			window.addEventListener("resize", resize);
			
			set(FE.Settings.renderer, true);
		}

		/* ==================== */
		/* ====== RENDER ====== */
		/* ==================== */

		function render(opts) {

			opts = opts || {};

			var S = FE.Settings;

			if (!render.init || S.fractal == "Buddhabrot") {

				S.resolution._factor = S.resolution.factor/S.resolution.steps;
				render.init = true;

				if (!opts.preview) {
					FE.Gui.makeURL();
					FE.Gui.update();
				}
			}

			renderer["render" + FE.Settings.fractal]();

			if (S.resolution._factor < S.resolution.factor && !opts.preview && S.fractal != "Buddhabrot") {

				S.resolution._factor = Math.min(S.resolution.factor, S.resolution._factor + S.resolution.factor/S.resolution.steps);
				window.setTimeout(render,1);

			} else { render.init = false; }
		}

		/* ================= */
		/* ====== SET ====== */
		/* ================= */

		function set(which, init) {

			FE.Settings.renderer = which;
			renderer = FE[which + "Renderer"];

			$webgl.style.display = $canvas.style.display = "none";
			$webgl.className = $canvas.className = "";

			var canvas = $("#"+which.toLowerCase());
			canvas.css("display", "block").addClass("active");

			FE.Renderer.canvas = canvas[0];

			if (init) { FE.Presets.load("None"); }
			else { render(); }
		}

		/* ==================== */
		/* ====== RESIZE ====== */
		/* ==================== */

		function resize() {

			if (resize.init) { return; }

			resize.init = true;
			resize.interval = window.setInterval(function() {
				
				var newSize = window.innerWidth+window.innerHeight
				
				if (resize.oldSize == newSize) {
					window.clearInterval(resize.interval);
					resize.init = false;
					resizeFinish();
				}

				resize.oldSize = newSize;
			}, 200);
		}

		/* =========================== */
		/* ====== RESIZE_FINISH ====== */
		/* =========================== */

		function resizeFinish() {

			var canvas = document.querySelector("canvas.active");

			canvas.width = ~~(window.innerWidth * FE.Settings.resolution._factor);
			canvas.height = ~~(window.innerHeight * FE.Settings.resolution._factor);

			if (FE.Settings.renderer == "WebGL")
			{ FE.WebGLRenderer.getContext().viewport(0, 0, window.innerWidth, window.innerHeight); }

			render();
		}

		return {
			init: init,
			render: render,
			set: set
		};

	}());

}(window.FE || {}, window));