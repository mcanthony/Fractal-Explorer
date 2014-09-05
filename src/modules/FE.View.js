;(function(FE, window, undefined) {

	"use strict";

	FE.View = (function() {

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init() {

			FE.View.mouse = {
				pos: { x: window.innerWidth/2, y: window.innerHeight/2 },
				drag: { x: 0, y: 0 }
			};

			var $container = document.getElementById("container");
			$container.addEventListener("mousedown", mousedown, false);
			$container.addEventListener("mousemove", mousemove, false);
			$container.addEventListener("mouseup", mouseup, false);
			$container.addEventListener("contextmenu", function(){ return false }, false);

			document.body.addEventListener("keyup", keyup, false);
			document.body.addEventListener("mousewheel", scroll, false);
			document.body.addEventListener("DOMMouseScroll", scroll, false);
		}

		/* ================== */
		/* ====== ZOOM ====== */
		/* ================== */

		function zoom(dz) {

			if (~FE.Settings.fractal.indexOf("Buddhabrot")) { return; }
			if (FE.Renderer.pending) { FE.requestZoom = dz; return; }

			var S = FE.Settings;
			var C = S.coordinates;
			var O = S.offset;

			var W = window.innerWidth;
			var H = window.innerHeight;

			var x = (FE.View.mouse.pos.x/W-0.5)*4;
			var y = (FE.View.mouse.pos.y/H-0.5)*4*H/W;

			// Magic calculations that literarely
			// took me 4 hours to figure out..

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

			C.z *= dz > 0 ? 0.9 : 1.1;
			FE.Renderer.render({ preview: true });

			// Render after 500 ms inactivity
			window.clearInterval(zoom.timeout);
			zoom.timeout = window.setTimeout(FE.Renderer.render, 500);
		}

		/* ================== */
		/* ====== DRAG ====== */
		/* ================== */

		function drag(dx, dy) {

			if (~FE.Settings.fractal.indexOf("Buddhabrot")) { return; }

			FE.View.requestDrag = true;

			if (!FE.Settings.resolution.renderOnDrag) {
				FE.Renderer.canvas.style.transform = "translate(" + dx + "px," + dy + "px)";
				return;
			}

			var W = window.innerWidth;
			var H = window.innerHeight;

			FE.Settings.coordinates.x = FE.View.mouse.dragStart.r - FE.View.mouse.drag.x / W * FE.Settings.coordinates.z;
			FE.Settings.coordinates.y = FE.View.mouse.dragStart.i - FE.View.mouse.drag.y / H * FE.Settings.coordinates.z * H/W;

			FE.Renderer.render({ preview: true });
		}

		/* ========================= */
		/* ====== DRAG_FINISH ====== */
		/* ========================= */

		function dragFinish() {

			if (~FE.Settings.fractal.indexOf("Buddhabrot")) { return; }
			FE.View.requestDrag = false;

			if (!FE.Settings.resolution.renderOnDrag) {

				var W = window.innerWidth;
				var H = window.innerHeight;

				FE.Settings.coordinates.x -= FE.View.mouse.drag.x / W * FE.Settings.coordinates.z;
				FE.Settings.coordinates.y -= FE.View.mouse.drag.y / H * FE.Settings.coordinates.z * H/W;
			}
			
			// Only render if dragging actually happened
			if (FE.View.mouse.drag.x || FE.View.mouse.drag.y) {
				FE.Renderer.render();
				FE.Renderer.canvas.style.transform = "none";
			}

			delete FE.View.mouse.dragStart;
		}

		/* ======================= */
		/* ====== MOUSEDOWN ====== */
		/* ======================= */

		function mousedown(e) {

			if (~FE.Settings.fractal.indexOf("Buddhabrot")) { return; }

			FE.View.mouse.down = e.which;
			FE.View.mouse.drag = { x: 0, y: 0 };

			FE.View.mouse.dragStart = {
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

			FE.View.mouse.pos = { x: e.pageX, y: e.pageY };

			// Update julia coordinates
			if (e.ctrlKey && FE.Settings.fractal == "Julia") {

				FE.Settings.position.x = (e.pageX / window.innerWidth - 0.5) * 2;
				FE.Settings.position.y = (e.pageY / window.innerHeight - 0.5) * 2;
				return FE.Renderer.render({ preview: true });
			}

			// Update drag values
			if (FE.View.mouse.dragStart) {

				FE.View.mouse.drag = {
					x: e.pageX - FE.View.mouse.dragStart.x,
					y: e.pageY - FE.View.mouse.dragStart.y
				};

				drag(FE.View.mouse.drag.x, FE.View.mouse.drag.y);
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

		/* ========================= */
		/* ====== CHANGE_MODE ====== */
		/* ========================= */

		function changeMode(mode, w, h) {

			var s = document.getElementById(FE.Settings.renderer.toLowerCase()).style;

			if (mode == "fullscreen") {
				s.top = "0px"; s.left = "0px";
				s.width = "100%"; s.height = "100%";
			} else if (mode == "center") {
				s.top =  Math.round(window.innerHeight/2-h/2) + "px";
				s.left = Math.round(window.innerWidth/2-w/2) + "px";
				s.width = w + "px";
				s.height = h + "px";
			}
		}

		/* ==================== */
		/* ====== EVENTS ====== */
		/* ==================== */

		function mouseup(e) { FE.View.mouse.drag && dragFinish(); }
		function keyup(e) { e.keyCode == 17 && FE.Settings.fractal == "Julia" && FE.Renderer.render(); }
		function scroll(e) { zoom(Math.max(-1,Math.min(1,(e.wheelDelta||-e.detail)))); }

		return {
			init: init,
			reset: reset,
			zoom: zoom,
			share: share,
			changeMode: changeMode,
			download: download
		};

	}());

}(window.FE || {}, window));