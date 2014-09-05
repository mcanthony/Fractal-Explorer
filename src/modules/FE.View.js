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

			view.mouse.pos.x = window.innerWidth/2;
			view.mouse.pos.y = window.innerHeight/2;

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

		function zoom(dz) {

			if (FE.Settings.fractal.indexOf("Buddhabrot") != -1) { return; }
			if (FE.Renderer.pending) { FE.View.requestZoom = dz; return; }

			var S = FE.Settings;
			var C = S.coordinates;
			var O = S.offset;
			var W = window.innerWidth;
			var H = window.innerHeight;
			var x = (view.mouse.pos.x/W-0.5)*4;
			var y = (view.mouse.pos.y/H-0.5)*4*H/W;

			if (zoom.lx != x) {
				O.x = x/-2*0.5;
				C.x = C.x || 0;
				C.x += (x-(zoom.lx||0))*C.z/4;
				zoom.lx = x;
			}

			if (zoom.ly != y) {
				O.y = y/(-2*H/W)*0.5;
				C.y = C.y || 0;
				C.y += (y-(zoom.ly||0))*C.z/4;
				zoom.ly = y;
			}

			C.z *= dz < 0 ? 0.9 : 1.1;

			FE.Renderer.render({ preview: true });
			window.clearInterval(zoom.timeout);
			zoom.timeout = window.setTimeout(FE.Renderer.render, 500);
		}

		/* ================== */
		/* ====== DRAG ====== */
		/* ================== */

		function drag(dx, dy) {

			if (FE.Settings.fractal.indexOf("Buddhabrot") != -1) { return; }

			FE.View.requestDrag = true;

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

			FE.View.requestDrag = false;
			
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

			view.mouse.pos = {
				x: e.pageX, y: e.pageY,
				z: FE.Settings.coordinates.z
			};

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

			zoom.lx = zoom.ly = null;
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
		function scroll(e) { zoom(e.originalEvent.deltaY); }

		return {
			init: init,
			reset: reset,
			zoom: zoom,
			share: share,
			download: download
		};

	}());

}(window.FE || {}, window));