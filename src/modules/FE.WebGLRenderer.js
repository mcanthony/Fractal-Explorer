;(function(FE, window, undefined) {

	"use strict";

	FE.WebGLRenderer = (function() {

		var gl, instance = {};

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init() {

			var canvas = document.getElementById("webgl");
			var contextIds = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
			var attributes = { alpha: false, depth: false, antialias: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true };

			contextIds.some(function(v) {
				try { gl = canvas.getContext(v, attributes); } catch(e){}
				if (gl) { return true; }
			});

			instance.programs = {
				Mandelbrot: createProgram("mandelbrot"),
				Buddhabrot: createProgram("buddhabrot"),
				Julia: createProgram("julia")
			};

			gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		}

		/* ======================== */
		/* ====== GET_SHADER ====== */
		/* ======================== */

		function getShader(name) {

			var req = new XMLHttpRequest();

			req.open("GET","glsl/" + name + ".glsl",false);
			req.send(0);

			return req.responseText;
		}

		/* ============================ */
		/* ====== CREATE_PROGRAM ====== */
		/* ============================ */

		function createProgram(fractal) {

			var vs = gl.createShader(gl.VERTEX_SHADER);
			var fs = gl.createShader(gl.FRAGMENT_SHADER);
			var pr = gl.createProgram();

			gl.shaderSource(vs, "attribute vec2 aPos;\nvoid main(){gl_Position=vec4(aPos.x,aPos.y,0.0,1.0);\n}");
			gl.shaderSource(fs, getShader(fractal));

			gl.compileShader(vs);
			gl.compileShader(fs);

			gl.attachShader(pr, vs);
			gl.attachShader(pr, fs);

			gl.linkProgram(pr);
			gl.useProgram(pr);

			gl.deleteShader(vs);
			gl.deleteShader(fs);

			pr.bfr = gl.createBuffer();
			pr.aPos = gl.getAttribLocation(pr, "aPos");

			pr.uResolution = gl.getUniformLocation(pr, "uResolution");
			pr.uIterations = gl.getUniformLocation(pr, "uIterations");
			pr.uCoordinates = gl.getUniformLocation(pr, "uCoordinates");
			pr.uPosition = gl.getUniformLocation(pr, "uPosition");
			pr.uColorScale = gl.getUniformLocation(pr, "uColorScale");
			pr.uColorShift = gl.getUniformLocation(pr, "uColorShift");
			pr.uShadingScale = gl.getUniformLocation(pr, "uShadingScale");
			pr.uSmoothShading = gl.getUniformLocation(pr, "uSmoothShading");

			gl.bindBuffer(gl.ARRAY_BUFFER, pr.bfr);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,1.0]), gl.STATIC_DRAW);
			gl.enableVertexAttribArray(pr.bfr);

			return pr;
		}

		/* ==================== */
		/* ====== RENDER ====== */
		/* ==================== */

		function render() {

			var S = FE.Settings;
			var W = ~~(gl.canvas.width = window.innerWidth * S.resolution._factor);
			var H = ~~(gl.canvas.height = window.innerHeight * S.resolution._factor);
			var pr = instance.programs[S.fractal];

			gl.uniform2f(pr.uResolution, W, H);
			gl.uniform1f(pr.uIterations, S.resolution.iterations);

			gl.uniform1f(pr.uSmoothShading, Number(S.shading.smooth));
			gl.uniform1f(pr.uShadingScale, S.shading.scale);

			gl.uniform3fv(pr.uCoordinates, new Float32Array([S.coordinates.x,S.coordinates.y,S.coordinates.z]));
			gl.uniform2fv(pr.uPosition, new Float32Array([S.position.x,S.position.y]));
			gl.uniform3f(pr.uColorScale, S.shading.color.scale.r, S.shading.color.scale.g, S.shading.color.scale.b);
			gl.uniform3f(pr.uColorShift, S.shading.color.shift.r, S.shading.color.shift.g, S.shading.color.shift.b);

			gl.vertexAttribPointer(pr.aPos, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}

		/* =============================== */
		/* ====== RENDER_MANDELBROT ====== */
		/* =============================== */

		function renderMandelbrot() {
			gl.useProgram(instance.programs.Mandelbrot);
			render();
		}

		/* =============================== */
		/* ====== RENDER_BUDDHABROT ====== */
		/* =============================== */

		function renderBuddhabrot() {
			alert("WebGL renderer not yet available for buddhabrot");
			gl.useProgram(instance.programs.Buddhabrot);
			render();
		}

		/* ========================== */
		/* ====== RENDER_JULIA ====== */
		/* ========================== */

		function renderJulia() {
			gl.useProgram(instance.programs.Julia);
			render();
		}

		/* ========================= */
		/* ====== GET_CONTEXT ====== */
		/* ========================= */

		function getContext() {
			return gl;
		}

		return {
			init: init,
			renderMandelbrot: renderMandelbrot,
			renderBuddhabrot: renderBuddhabrot,
			renderJulia: renderJulia,
			getContext: getContext
		}

	}());

}(window.FE || {}, window));