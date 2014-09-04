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
			var buddhabrot = S.fractal.indexOf("Buddhabrot") != -1;
			var render_fn = renderer["render" + S.fractal];

			if (!render_fn) {
				alert(S.renderer + " renderer not yet available for " + S.fractal);
				return;
			}

			if (!render.init && !FE.Renderer.pending) {

				S.resolution._factor = buddhabrot ? S.resolution.factor : S.resolution.factor/S.resolution.steps;
				render.init = true;

				!opts.preview && FE.Gui.update();
			}

			FE.Renderer.pending = true;
			render_fn();
			FE.Renderer.pending = false;

			if (FE.View.requestZoom) {
				var args = FE.View.requestZoom;
				renderer.init = false;

				delete FE.View.requestZoom;
				return FE.View.zoom.apply(FE.View.zoom, args);
			}

			if (S.resolution._factor < S.resolution.factor && !opts.preview && !FE.View.requestDrag && !buddhabrot) {

				S.resolution._factor = Math.min(S.resolution.factor, S.resolution._factor + S.resolution.factor/S.resolution.steps);
				window.setTimeout(render,1);

			} else { render.init = false; }
		}

		/* ================= */
		/* ====== SET ====== */
		/* ================= */

		function set(which, init) {

			if (which == "WebGL" && !window.WebGLRenderingContext) {
				alert("Your browser does not support WebGL");
				which = "Canvas";
			}

			FE.Settings.renderer = which;
			renderer = FE[which + "Renderer"];

			$webgl.style.display = $canvas.style.display = "none";
			$webgl.className = $canvas.className = "";

			var canvas = $("#"+which.toLowerCase());
			canvas.css("display", "block").addClass("active");

			FE.Renderer.canvas = canvas[0];

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

			canvas.width = ~~(W * FE.Settings.resolution._factor);
			canvas.height = ~~(H * FE.Settings.resolution._factor);

			if (FE.Settings.renderer == "WebGL")
			{ FE.WebGLRenderer.getContext().viewport(0, 0, W, H); }

			render({ preview: true });
			if (resize.interval) { return; }

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