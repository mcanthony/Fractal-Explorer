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

			if (FE.Settings.fractal.indexOf("Buddhabrot") != -1) { return; }
			if (zoom.pending || FE.Renderer.pending) { FE.View.requestZoom = [x,y,dz]; return; }

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
				zoom.pending = false;
				FE.Renderer.render();
				$(this).css("transform","none");
			});
		}

		/* ================== */
		/* ====== DRAG ====== */
		/* ================== */

		function drag(dx, dy) {

			if (FE.Settings.fractal.indexOf("Buddhabrot") != -1) { return; }

			if (!FE.Settings.resolution.renderOnDrag) {
				$(FE.Renderer.canvas).css({ transform: "translate(" + dx + "px," + dy + "px)" });
				return;
			}

			var aspect = window.innerHeight / window.innerWidth;

			FE.Settings.coordinates.x = view.mouse.dragStart.r - view.mouse.drag.x / window.innerWidth * FE.Settings.coordinates.z;
			FE.Settings.coordinates.y = view.mouse.dragStart.i - view.mouse.drag.y / window.innerHeight * FE.Settings.coordinates.z * aspect;

			FE.Renderer.render({ preview: true });
		}

		/* ========================= */
		/* ====== DRAG_FINISH ====== */
		/* ========================= */

		function dragFinish() {

			if (FE.Settings.fractal.indexOf("Buddhabrot") != -1) { return; }

			if (!FE.Settings.resolution.renderOnDrag) {

				var aspect = window.innerHeight / window.innerWidth;
				FE.Settings.coordinates.x -= view.mouse.drag.x / window.innerWidth * FE.Settings.coordinates.z;
				FE.Settings.coordinates.y -= view.mouse.drag.y / window.innerHeight * FE.Settings.coordinates.z * aspect;
			}

			if (view.mouse.drag.x || view.mouse.drag.y) {
				FE.Renderer.render();
				$(FE.Renderer.canvas).css("transform","none");
			}

			delete view.mouse.dragStart;
		}

		/* ======================= */
		/* ====== MOUSEDOWN ====== */
		/* ======================= */

		function mousedown(e) {

			view.mouse.down = e.which;
			view.mouse.drag = { x: 0, y: 0 };
			view.mouse.dragStart = {
				x: e.pageX,
				y: e.pageY,
				r: FE.Settings.coordinates.x,
				i: FE.Settings.coordinates.y
			};
			
			e.preventDefault();
		}

		/* ======================= */
		/* ====== MOUSEMOVE ====== */
		/* ======================= */

		function mousemove(e) {

			view.mouse.pos = { x: e.pageX, y: e.pageY };

			if (e.ctrlKey && FE.Settings.fractal == "Julia") {
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

			var url = window.location.protocol + '//' + window.location.host + window.location.pathname;
			window.history.replaceState(null, document.title, url);

			FE.Presets.load("None");
		}

		/* =================== */
		/* ====== SHARE ====== */
		/* =================== */

		function share() {
			var hash = btoa(JSON.stringify(FE.Settings));
			var url = window.location.protocol + '//' + window.location.host + window.location.pathname;
			window.history.replaceState(null, document.title, url + "#" + hash);
			alert("Done! Copy the URL in your addressbar and share it anywhere.");
		}

		/* ====================== */
		/* ====== DOWNLOAD ====== */
		/* ====================== */

		function download() {

			var S = FE.Settings;
			var a = document.createElement("a");
			
			a.download = S.fractal + "{" + [S.coordinates.x,S.coordinates.y,S.coordinates.z,S.resolution.iterations].join(",") + "}.png";
			a.href = document.querySelector("canvas.active").toDataURL();
			a.target = "_self";

			document.body.appendChild(a);
			a.click(); a.remove();
		}

		/* ==================== */
		/* ====== EVENTS ====== */
		/* ==================== */

		function mouseup(e) { view.mouse && view.mouse.drag && dragFinish(); }
		function keyup(e) { e.keyCode == 17 && FE.Settings.fractal == "Julia" && FE.Renderer.render(); }
		function scroll(e) { zoom(view.mouse.pos.x, view.mouse.pos.y, e.originalEvent.deltaY < 0 ? 0.5 : 2.0); }

		return {
			init: init,
			reset: reset,
			zoom: zoom,
			share: share,
			download: download
		};

	}());

}(window.FE || {}, window));