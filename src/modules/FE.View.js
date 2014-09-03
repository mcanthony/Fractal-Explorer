;(function(FE, window, undefined) {

	"use strict";

	FE.View = (function() {

		var view = {
			mouse: {
				pos: { x: 0, y: 0 },
				drag: { x: 0, y: 0 }
			}
		};

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init() {

			$("#container")
			.on("mousedown", mousedown)
			.on("mousemove", mousemove)
			.on("mouseup", mouseup)
			.on("contextmenu", function(){ return false });

			$(document.body)
			.on("keyup", keyup)
			.on("mousewheel", scroll);
		}

		/* ================== */
		/* ====== ZOOM ====== */
		/* ================== */

		function zoom(x, y, dz) {

			if (zoom.pending) { return; }
			zoom.pending = true;

			var S = FE.Settings;
			var W = window.innerWidth;
			var H = window.innerHeight;
			var A = W/H;

			S.coordinates.z *= dz;

			if (dz == 0.5) {
				S.coordinates.x += (x/W-0.5)*S.coordinates.z;
				S.coordinates.y += (y/H-0.5)*S.coordinates.z;
			} else {
				x = W/2;
				y = H/2;
			}

			$(FE.Renderer.canvas).transition({
			
				scale: 1/dz,
				x: -(x/W-0.5)*W/2,
				y: -(y/H-0.5)*H/2*A
			
			}, function() {
				FE.Renderer.render();
				$(this).css("transform", "none");
				zoom.pending = false;
			});
		}

		/* ================== */
		/* ====== DRAG ====== */
		/* ================== */

		function drag(dx, dy) {
			$(FE.Renderer.canvas).css({ transform: "translate(" + dx + "px," + dy + "px)" });
		}

		/* ========================= */
		/* ====== DRAG_FINISH ====== */
		/* ========================= */

		function dragFinish() {

			var aspect = window.innerHeight / window.innerWidth;

			FE.Settings.coordinates.x -= view.mouse.drag.x / window.innerWidth * FE.Settings.coordinates.z;
			FE.Settings.coordinates.y -= view.mouse.drag.y / window.innerHeight * FE.Settings.coordinates.z * aspect;
			
			if (view.mouse.drag.x || view.mouse.drag.y) {
				FE.Renderer.render();
				$(FE.Renderer.canvas).css({ transform: "translate(0px,0px)" });
			}

			delete view.mouse.dragStart;
		}

		/* ======================= */
		/* ====== MOUSEDOWN ====== */
		/* ======================= */

		function mousedown(e) {

			view.mouse.down = e.which;
			view.mouse.drag = { x: 0, y: 0 };
			view.mouse.dragStart = { x: e.pageX, y: e.pageY };
			
			e.preventDefault();
		}

		/* ======================= */
		/* ====== MOUSEMOVE ====== */
		/* ======================= */

		function mousemove(e) {

			view.mouse.pos = { x: e.pageX, y: e.pageY };

			if (e.ctrlKey) {
				FE.Settings.position.x = (e.pageX / window.innerWidth - 0.5) * 2;
				FE.Settings.position.y = (e.pageY / window.innerHeight - 0.5) * 2;
				return FE.Renderer.render({ preview: true });
			}

			if (view.mouse.dragStart) {

				view.mouse.drag = {
					x: e.pageX - view.mouse.dragStart.x,
					y: e.pageY - view.mouse.dragStart.y
				};

				drag(view.mouse.drag.x, view.mouse.drag.y);
			}
		}

		/* =================== */
		/* ====== RESET ====== */
		/* =================== */

		function reset() {
			FE.Settings.coordinates = { x: 0, y: 0, z: 4 };
			FE.Gui.update();
			FE.Renderer.render();
		}

		/* ====================== */
		/* ====== DOWNLOAD ====== */
		/* ====================== */

		function download() {

			var S = FE.Settings;
			var a = document.createElement("a");
			
			a.download = S.fractal + "{" + [S.coordinates.x,S.coordinates.y,S.coordinates.z,S.iterations].join(",") + "}.png";
			a.href = document.querySelector("canvas.active").toDataURL();
			a.target = "_self";

			document.body.appendChild(a);
			a.click(); a.remove();
		}

		/* ==================== */
		/* ====== EVENTS ====== */
		/* ==================== */

		function mouseup(e) { view.mouse && view.mouse.drag && dragFinish(); }
		function keyup(e) { e.keyCode == 17 && FE.Renderer.render(); }
		function scroll(e) { zoom(view.mouse.pos.x, view.mouse.pos.y, e.originalEvent.deltaY < 0 ? 0.5 : 2.0); }

		return {
			init: init,
			reset: reset,
			zoom: zoom,
			download: download
		};

	}());

}(window.FE || {}, window));