;(function(FE, window, undefined) {

	"use strict";

	FE.Gui = (function() {

		var datGUI;

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init(reset) {

			reset ? datGUI.destroy() : readURL();
			datGUI = new dat.GUI();

			var S = FE.Settings;
			var d = datGUI;
			var f = "onFinishChange";
			var r = FE.Renderer.render;
			
			d.resolution = d.addFolder("Resolution");
			d.resolution.add(S.resolution,"factor",0.1,1).step(0.01)[f](r);
			d.resolution.add(S.resolution,"steps",1,10).step(1)[f](r);

			d.shading = d.addFolder("Shading");
			d.shading.scale = d.shading.addFolder("Color Scale");
			d.shading.scale.add(S.shading.color.scale,"r", 0,1)[f](r);
			d.shading.scale.add(S.shading.color.scale,"g", 0,1)[f](r);
			d.shading.scale.add(S.shading.color.scale,"b", 0,1)[f](r);

			d.shading.shift = d.shading.addFolder("Color Shift");
			d.shading.shift.add(S.shading.color.shift,"r",-1,1)[f](r);
			d.shading.shift.add(S.shading.color.shift,"g",-1,1)[f](r);
			d.shading.shift.add(S.shading.color.shift,"b",-1,1)[f](r);
			
			d.shading.add(S.shading,"scale",0.05,1)[f](r);
			d.shading.add(S.shading,"smooth")[f](r);
			//d.shading.add(FE.Gui,"randomShading");
			//d.shading.add(FE.Gui,"resetShading");

			d.view = d.addFolder("View");
			d.view.coordinates = d.view.addFolder("Coordinates");
			d.view.coordinates.add(S.coordinates,"x",-2.0,2.0).step(0.01)[f](r);
			d.view.coordinates.add(S.coordinates,"y",-2.0,2.0).step(0.01)[f](r);
			d.view.coordinates.add(S.coordinates,"z", 4.0,0.0).step(0.01)[f](r);

			d.view.position = d.view.addFolder("Position");
			d.view.position.add(S.position,"x",-2.0,2.0).step(0.01)[f](r);
			d.view.position.add(S.position,"y",-2.0,2.0).step(0.01)[f](r);

			d.view.add(FE.View,"reset");
			d.view.add(FE.View,"download");

			d.add(S,"renderer",["Canvas","WebGL"])[f](FE.Renderer.set);
			d.add(S,"fractal",Object.keys(FE.Presets.presets))[f](function() { init(true); FE.Presets.load("None"); });
			d.add(S,"preset",Object.keys(FE.Presets.presets[S.fractal])).onChange(FE.Presets.load);
			d.add(S,"iterations",10,1000).step(1)[f](r);

			d.add(FE.Gui,"github");
			d.add(FE.Gui,"help");
		}

		/* ==================== */
		/* ====== UPDATE ====== */
		/* ==================== */

		function update() {

			datGUI.__controllers.forEach(function(controller) {
				controller.updateDisplay();
			});

			updateFolders(datGUI);
		}

		/* ============================ */
		/* ====== UPDATE_FOLDERS ====== */
		/* ============================ */

		function updateFolders(d) {
			Object.keys(d.__folders).forEach(function(folder) {
				folder = d.__folders[folder];

				folder.__controllers.forEach(function(controller) {
					controller.updateDisplay();
				});

				if (Object.keys(folder.__folders).length) { updateFolders(folder); }
			});
		}

		/* ====================== */
		/* ====== READ_URL ====== */
		/* ====================== */

		function readURL() {

			var fail = false;

			try {

				FE.Settings = JSON.parse(atob(window.location.hash.substr(1)));
				update();

			} catch(e) { fail = true; }

			return fail;
		}

		/* ====================== */
		/* ====== MAKE_URL ====== */
		/* ====================== */

		function makeURL() {
			var hash = btoa(JSON.stringify(FE.Settings));
			var url = window.location.protocol + '//' + window.location.host + window.location.pathname;
			window.history.replaceState(null, document.title, url + "#" + hash);
		}

		/* ================== */
		/* ====== HELP ====== */
		/* ================== */

		function help() {
			alert([
				"Controls",
				"- Drag to move around",
				"- Mousewheel to zoom",
				"- CTRL + Move to alter Julia fractal\n",
				"Renderer",
				"- Canvas (higher precision but slower)",
				"- WebGL (smaller precision but faster)"
			].join("\n"));
		}

		/* ==================== */
		/* ====== GITHUB ====== */
		/* ==================== */

		function github() { window.open("https://github.com/elias94xx/Fractal-Explorer", "_blank").focus(); }

		return {
			init: init,
			update: update,
			makeURL: makeURL,
			github: github,
			help: help
		};

	}());

}(window.FE || {}, window));