;(function(FE, window, undefined) {

	"use strict";

	FE.CanvasRenderer = (function() {

		var ctx;

		/* ================== */
		/* ====== INIT ====== */
		/* ================== */

		function init() {
			ctx = document.getElementById("canvas").getContext("2d");
		}

		/* =============================== */
		/* ====== RENDER_MANDELBROT ====== */
		/* =============================== */

		function renderMandelbrot() {

			var S = FE.Settings;
			var W = ~~(ctx.canvas.width = window.innerWidth * S.resolution._factor);
			var H = ~~(ctx.canvas.height = window.innerHeight * S.resolution._factor);

			var imageData = ctx.createImageData(W,H),

				d = imageData.data,
			    N = S.resolution.iterations,

			    CX = S.coordinates.x,
			    CY = S.coordinates.y,
			    CZ = S.coordinates.z,

			    RSC = S.shading.color.scale.r,
			    GSC = S.shading.color.scale.g,
			    BSC = S.shading.color.scale.b,

			    RSH = S.shading.color.shift.r,
			    GSH = S.shading.color.shift.g,
			    BSH = S.shading.color.shift.b,

			    SDS = S.shading.scale,
			    STH = S.shading.smooth,

			    r,i,t,n,_x,_y;

			for(var y = 0; y < H; y++) {

				_y = (y/H-0.5)*CZ*H/W+CY;

				for(var x = 0; x < W; x++) {

					_x = (x/W-0.5)*CZ+CX;

					r=i=t=0;n=N;

					while(r*r+i*i<128&&n--) {
						r = r*r-i*i+_x;
						i = 2*t*i+_y;t=r;
					}
					
					if (STH)
					{ n=n>0?(N-n-Math.log(Math.log(r*r+i*i)/Math.log(2))/Math.log(2))*SDS:0; }
					else
					{ n = n>0?(N-n+101)*SDS:0; }

					i = (y*W+x)*4;

					d[i++] = n&&Math.sin((n+RSH)*RSC)*255;
					d[i++] = n&&Math.sin((n+GSH)*GSC)*255;
					d[i++] = n&&Math.sin((n+BSH)*BSC)*255;
					d[i++] = 255;
				}
			}

			ctx.putImageData(imageData,0,0);
		}

		/* =============================== */
		/* ====== RENDER_BUDDHABROT ====== */
		/* =============================== */

		function renderBuddhabrot() {

			var S = FE.Settings;
			var W = ~~(ctx.canvas.width = window.innerWidth * S.resolution._factor);
			var H = ~~(ctx.canvas.height = window.innerHeight * S.resolution._factor);

			var imageData = ctx.createImageData(W,H),

				d = imageData.data,
				A = [],
			    N = S.resolution.iterations,

			    CX = S.coordinates.x,
			    CY = S.coordinates.y,
			    CZ = S.coordinates.z,

			    RSC = S.shading.color.scale.r,
			    GSC = S.shading.color.scale.g,
			    BSC = S.shading.color.scale.b,

			    RSH = S.shading.color.shift.r,
			    GSH = S.shading.color.shift.g,
			    BSH = S.shading.color.shift.b,

			    SDS = S.shading.scale,
			    STH = S.shading.smooth,

			    r,i,j,k,l,t,n,_x,_y,x,y;

			for(y = 0; y < H; y++) {

				_y = (y/H-0.5)*CZ;

				for(x = 0; x < W; x++) {

					_x = (x/W-0.5)*CZ;

					r=i=t=0;n=N;

					while(r*r+i*i<2&&n--) {
						r = r*r-i*i+_x;
						i = 2*t*i+_y;t=r;
					}

					r*r+i*i>2 && A.push([_x,_y]);
				}
			}

			l = (W+H*H/W)/100;

			for(k=A.length;k--;) {

				x = A[k][0];
				y = A[k][1];
				r=i=t=0;n=N;

				while(r*r+i*i<2&&n--) {

					j=(~~((r+2)/4*H+0.5)*W+~~((i*H/W+2)/4*W+0.5))*4;
					d[j]=d[j+1]=d[j+2]=d[j+2]+l;d[j+3]=255;

					r = r*r-i*i+x;
					i = 2*t*i+y;t=r;
				}
			}

			ctx.putImageData(imageData,0,0);
		}

		/* ==================================== */
		/* ====== RENDER_ANTI_BUDDHABROT ====== */
		/* ==================================== */

		function renderAntiBuddhabrot() {

			var S = FE.Settings;
			var W = ~~(ctx.canvas.width = window.innerWidth * S.resolution._factor);
			var H = ~~(ctx.canvas.height = window.innerHeight * S.resolution._factor);

			var imageData = ctx.createImageData(W,H),

				d = imageData.data,
			    N = S.resolution.iterations,

			    CX = S.coordinates.x,
			    CY = S.coordinates.y,
			    CZ = S.coordinates.z,

			    RSC = S.shading.color.scale.r,
			    GSC = S.shading.color.scale.g,
			    BSC = S.shading.color.scale.b,

			    RSH = S.shading.color.shift.r,
			    GSH = S.shading.color.shift.g,
			    BSH = S.shading.color.shift.b,

			    SDS = S.shading.scale,
			    STH = S.shading.smooth,

			    r,i,j,l,t,n,_x,_y,x,y;

			l = (W+H*H/W)/300;

			for(y = 0; y < H; y++) {

				_y = (y/H-0.5)*CZ;

				for(x = 0; x < W; x++) {

					_x = (x/W-0.5)*CZ;

					r=i=t=0;n=N;

					while(r*r+i*i<2&&n--) {

						j=(~~((r+2)/4*H+0.5)*W+~~((i*H/W+2)/4*W+0.5))*4;
						d[j]=d[j+1]=d[j+2]=d[j+2]+l;d[j+3]=255;

						r = r*r-i*i+_x;
						i = 2*t*i+_y;t=r;
					}
				}
			}

			ctx.putImageData(imageData,0,0);
		}

		/* ========================== */
		/* ====== RENDER_JULIA ====== */
		/* ========================== */

		function renderJulia() {

			var S = FE.Settings;
			var W = ~~(ctx.canvas.width = window.innerWidth * S.resolution._factor);
			var H = ~~(ctx.canvas.height = window.innerHeight * S.resolution._factor);

			var imageData = ctx.createImageData(W,H),

				d = imageData.data,
			    N = S.resolution.iterations,

			    CX = S.coordinates.x,
			    CY = S.coordinates.y,
			    CZ = S.coordinates.z,

			    PX = S.position.x,
			    PY = S.position.y,

			    RSC = S.shading.color.scale.r,
			    GSC = S.shading.color.scale.g,
			    BSC = S.shading.color.scale.b,

			    RSH = S.shading.color.shift.r,
			    GSH = S.shading.color.shift.g,
			    BSH = S.shading.color.shift.b,

			    SDS = S.shading.scale,
			    STH = S.shading.smooth,

			    r,i,t,n,_y,_x;

			for(var y = 0; y < H; y++) {

				_y = (y/H-0.5)*CZ*H/W+CY;

				for(var x = 0; x < W; x++) {

					_x = (x/W-0.5)*CZ+CX;

					r=t=_x;i=_y;n=N;

					while(r*r+i*i<128&&n--) {
						r = r*r-i*i+PX;
						i = 2*t*i+PY;t=r;
					}
					
					if (STH)
					{ n=n>0?(N-n-Math.log(Math.log(r*r+i*i)/Math.log(2))/Math.log(2))*SDS:0; }
					else
					{ n = n>0?(N-n+101)*SDS:0; }

					i = (y*W+x)*4;

					d[i++] = n&&Math.sin((n+RSH)*RSC)*255;
					d[i++] = n&&Math.sin((n+GSH)*GSC)*255;
					d[i++] = n&&Math.sin((n+BSH)*BSC)*255;
					d[i++] = 255;
				}
			}

			ctx.putImageData(imageData,0,0);
		}

		return {
			init: init,
			renderMandelbrot: renderMandelbrot,
			renderBuddhabrot: renderBuddhabrot,
			renderAntiBuddhabrot: renderAntiBuddhabrot,
			renderJulia: renderJulia,
		}

	}());

}(window.FE || {}, window));