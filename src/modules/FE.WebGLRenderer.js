;(function(FE, window, undefined) {

	"use strict";

	FE.WebGLRenderer = (function() {

		var gl, shader = {}, instance = {};

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init() {

			if (!window.WebGLRenderingContext) { return; }

			var canvas = document.getElementById("webgl");
			var contextIds = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
			var attributes = { alpha: false, depth: false, antialias: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true };

			contextIds.some(function(v) {
				try { gl = canvas.getContext(v, attributes); } catch(e){}
				if (gl) { return true; }
			});

			instance.programs = {
				Mandelbrot: createProgram("Mandelbrot"),
				Julia: createProgram("Julia")
			};

			gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		}

		/* ============================ */
		/* ====== CREATE_PROGRAM ====== */
		/* ============================ */

		function createProgram(fractal) {

			var vs = gl.createShader(gl.VERTEX_SHADER);
			var fs = gl.createShader(gl.FRAGMENT_SHADER);
			var pr = gl.createProgram();

			gl.shaderSource(vs, "attribute vec2 aPos;\nvoid main(){gl_Position=vec4(aPos.x,aPos.y,0.0,1.0);\n}");
			gl.shaderSource(fs, shader[fractal]);

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
			pr.uOffset = gl.getUniformLocation(pr, "uOffset");
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

			gl.useProgram(pr);

			gl.uniform2f(pr.uResolution, W, H);
			gl.uniform1f(pr.uIterations, S.resolution.iterations);

			gl.uniform1f(pr.uSmoothShading, Number(S.shading.smooth));
			gl.uniform1f(pr.uShadingScale, S.shading.scale);

			gl.uniform3fv(pr.uCoordinates, new Float32Array([S.coordinates.x,-S.coordinates.y,S.coordinates.z]));
			gl.uniform2fv(pr.uPosition, new Float32Array([S.position.x,-S.position.y]));
			gl.uniform2fv(pr.uOffset, new Float32Array([S.offset.x,-S.offset.y]))

			gl.uniform3f(pr.uColorScale, S.shading.color.scale.r, S.shading.color.scale.g, S.shading.color.scale.b);
			gl.uniform3f(pr.uColorShift, S.shading.color.shift.r, S.shading.color.shift.g, S.shading.color.shift.b);

			gl.vertexAttribPointer(pr.aPos, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}

		/* =============================== */
		/* ====== SHADER_MANDELBROT ====== */
		/* =============================== */

		shader.Mandelbrot = "precision mediump float;\n"

		+ "uniform vec2 uResolution;\n"
		+ "uniform vec3 uCoordinates;\n"
		+ "uniform vec2 uOffset;\n"
		+ "uniform vec3 uColorScale;\n"
		+ "uniform vec3 uColorShift;\n"
		+ "uniform float uShadingScale;\n"
		+ "uniform float uIterations;\n"
		+ "uniform float uSmoothShading;\n"

		+ "void main()\n"
		+ "{\n"
		    + "vec2 z = vec2(0);\n"
			+ "vec2 c = (gl_FragCoord.xy/uResolution.xy-0.5+uOffset) * uCoordinates.z * vec2(1,uResolution.y/uResolution.x);\n"

		    + "float n = 0.0;\n"

			+ "for(float i=0.0;i<1000.0;i+=1.0)\n"
			+ "{\n"
				+ "z = vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c+uCoordinates.xy;\n"
		        + "n = z.x*z.x+z.y*z.y;\n"

		        + "if(n>128.0||i>uIterations)\n"
		        + "{\n"
		            + "if (uSmoothShading>0.0)\n"
		            + "n = i>0.0?(i-log2(log2(z.x*z.x+z.y*z.y)))*uShadingScale:0.0;\n"
		            + "else\n"
		            + "n = i>0.0?(1000.0-i+101.0)*uShadingScale:0.0;\n"
		            + "gl_FragColor=vec4(sin((n+uColorShift)*uColorScale),1);\n"
		            + "break;\n"
		        + "}\n"
			+ "}\n"
		+ "}";

		/* ========================== */
		/* ====== SHADER_JULIA ====== */
		/* ========================== */

		shader.Julia = "precision mediump float;\n"

		+ "uniform vec2 uResolution;\n"
		+ "uniform vec3 uCoordinates;\n"
		+ "uniform vec2 uPosition;\n"
		+ "uniform vec2 uOffset;\n"
		+ "uniform vec3 uColorScale;\n"
		+ "uniform vec3 uColorShift;\n"
		+ "uniform float uShadingScale;\n"
		+ "uniform float uIterations;\n"
		+ "uniform float uSmoothShading;\n"

		+ "void main()\n"
		+ "{\n"
		    + "vec2 z = ((gl_FragCoord.xy/uResolution.xy-0.5+uOffset) * uCoordinates.z * vec2(1,uResolution.y/uResolution.x) + uCoordinates.xy);\n"
		    + "vec2 c = uPosition;\n"

		    + "float n = 0.0;\n"

			+ "for(float i=0.0;i<1000.0;i+=1.0)\n"
			+ "{\n"
				+ "z = vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;\n"
		        + "n = z.x*z.x+z.y*z.y;\n"

		        + "if(n>128.0||i>uIterations)\n"
		        + "{\n"
		            + "if (uSmoothShading>0.0)\n"
		            + "n = i>0.0?(i-log2(log2(z.x*z.x+z.y*z.y)))*uShadingScale:0.0;\n"
		            + "else\n"
		            + "n = i>0.0?(1000.0-i+101.0)*uShadingScale:0.0;\n"
		            + "gl_FragColor=vec4(sin((n+uColorShift)*uColorScale),1);\n"
		            + "break;\n"
		        + "}\n"
			+ "}\n"
		+ "}";

		/* ========================= */
		/* ====== GET_CONTEXT ====== */
		/* ========================= */

		function getContext() {
			return gl;
		}

		return {
			init: init,
			render: render,
			getContext: getContext
		}

	}());

}(window.FE || {}, window));