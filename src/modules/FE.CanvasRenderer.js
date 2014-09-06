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

			    OX = S.offset.x,
			    OY = S.offset.y,

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

				_y = (y/H-0.5+OY)*CZ*H/W+CY;

				for(var x = 0; x < W; x++) {

					_x = (x/W-0.5+OX)*CZ+CX;

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
			var R = ~~(1000/(S.coordinates.z/4)+0.5);

			FE.View.changeMode("center", R, R);
			R = ~~(R*S.resolution.factor+0.5);

			ctx.canvas.width = R;
			ctx.canvas.height = R;

			var imageData = ctx.createImageData(R,R),
				
				D = imageData.data,
			    N = S.resolution.iterations,
			    B = S.resolution.buddhaEscape,
				F = 1/Math.log(R+N)*127,

			    r,i,j,t,n,_x,_y,x,y;

			for(y = 0; y < R; y++) {

				_y = (y/R-0.5)*4;

				for(x = 0; x < R; x++) {

					_x = (x/R-0.5)*4;

					if (_x*_x+_y*_y>2) { continue; }

					r=i=t=0;n=N;

					while(r*r+i*i<2&&n--) {
						r = r*r-i*i+_x;
						i = 2*t*i+_y;t=r;
					}

					if(n<(N-B)&&r*r+i*i>2) {

						r=i=t=0;n=N;

						while(r*r+i*i<2&&n--) {

							j=(~~((r+2)/4*R+0.5)*R+~~((i+2)/4*R+0.5))*4;
							D[j]=D[j+1]=D[j+2]=D[j]+F;D[j+3]=255;

							r = r*r-i*i+_x;
							i = 2*t*i+_y;t=r;
						}
					}
				}
			}

			ctx.putImageData(imageData,0,0);
		}

		/* ==================================== */
		/* ====== RENDER_ANTI_BUDDHABROT ====== */
		/* ==================================== */

		function renderAntiBuddhabrot() {

			var S = FE.Settings;
			var R = ~~(1000/(S.coordinates.z/4)+0.5);

			FE.View.changeMode("center", R, R);
			R = ~~(R*S.resolution.factor+0.5);

			ctx.canvas.width = R;
			ctx.canvas.height = R;

			var imageData = ctx.createImageData(R,R),
				
				D = imageData.data,
			    N = S.resolution.iterations,
				F = 1/Math.log(R+N)*50,

			    r,i,j,t,n,_x,_y,x,y;

			for(y = 0; y < R; y++) {

				_y = (y/R-0.5)*4;

				for(x = 0; x < R; x++) {

					_x = (x/R-0.5)*4;

					if (_x*_x+_y*_y>2) { continue; }

					r=i=t=0;n=N;

					while(r*r+i*i<2&&n--) {
						r = r*r-i*i+_x;
						i = 2*t*i+_y;t=r;
					}

					if(r*r+i*i<2) {

						r=i=t=0;n=N;

						while(r*r+i*i<2&&n--) {

							j=(~~((r+2)/4*R+0.5)*R+~~((i+2)/4*R+0.5))*4;
							D[j]=D[j+1]=D[j+2]=D[j]+F;D[j+3]=255;

							r = r*r-i*i+_x;
							i = 2*t*i+_y;t=r;
						}
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

			    OX = S.offset.x,
			    OY = S.offset.y,

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

				_y = (y/H-0.5+OY)*CZ*H/W+CY;

				for(var x = 0; x < W; x++) {

					_x = (x/W-0.5+OX)*CZ+CX;

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