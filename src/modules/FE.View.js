;(function(FE, window, undefined) {

	"use strict";

	FE.View = (function() {

		var instance = {
			mouse: {
				pos: { x: 0, y: 0 },
				drag: { x: 0, y: 0 }
			}
		};

		var $container;

		function init() {

			$container = document.getElementById("container");
			$container.addEventListener("mousedown", mousedown);
			$container.addEventListener("mousemove", mousemove);
			$container.addEventListener("mouseup", mouseup);
			$container.oncontextmenu=function(){return false};

			document.body.addEventListener("keyup", keyup);
			$(document.body).on("mousewheel", scroll);
		}

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

		function scroll(e) {
			zoom(
				instance.mouse.pos.x,
				instance.mouse.pos.y,
				e.originalEvent.deltaY < 0 ? 0.5 : 2.0
			);
		}

		function drag(dx, dy) {
			$(FE.Renderer.canvas).css({ transform: "translate(" + dx + "px," + dy + "px)" });
		}

		function dragFinish() {

			var aspect = window.innerHeight / window.innerWidth;

			FE.Settings.coordinates.x -= instance.mouse.drag.x / window.innerWidth * FE.Settings.coordinates.z;
			FE.Settings.coordinates.y -= instance.mouse.drag.y / window.innerHeight * FE.Settings.coordinates.z * aspect;
			
			if (instance.mouse.drag.x || instance.mouse.drag.y) { FE.Renderer.render(); }

			$(FE.Renderer.canvas).css({ transform: "translate(0px,0px)" });
			delete instance.mouse.dragStart;
		}

		function mousedown(e) {

			e.preventDefault();

			instance.mouse.down = e.which;
			instance.mouse.drag = { x: 0, y: 0 };
			instance.mouse.dragStart = { x: e.pageX, y: e.pageY };
		}

		function mousemove(e) {

			instance.mouse.pos = {
				x: e.pageX,
				y: e.pageY
			};

			if (e.ctrlKey) {
				instance.alteredPosition = true;
				FE.Settings.position.x = (e.pageX / window.innerWidth - 0.5) * 2;
				FE.Settings.position.y = (e.pageY / window.innerHeight - 0.5) * 2;
				FE.Renderer.render({ preview: true });
			}

			if (instance.mouse.dragStart) {

				instance.mouse.drag = {
					x: e.pageX - instance.mouse.dragStart.x,
					y: e.pageY - instance.mouse.dragStart.y
				};

				drag(instance.mouse.drag.x, instance.mouse.drag.y);
			}
		}

		function mouseup(e) {
			if (instance.mouse && instance.mouse.drag) { dragFinish(); }
		}

		function keyup(e) {
			if (e.keyCode == 17) { FE.Renderer.render(); }
		}

		function reset() {
			FE.Settings.coordinates = { x: 0, y: 0, z: 4 };
			FE.Gui.update();
			FE.Renderer.render();
		}

		function download() {

			var S = FE.Settings;
			var a = document.createElement("a");
			
			a.download = S.fractal + "{" + [S.coordinates.x,S.coordinates.y,S.coordinates.z,S.iterations].join(",") + "}.png";
			a.href = document.querySelector("canvas.active").toDataURL();
			a.target = "_self";

			document.body.appendChild(a);
			a.click(); a.remove();
		}

		return {
			init: init,
			reset: reset,
			zoom: zoom,
			download: download
		};

	}());

}(window.FE || {}, window));