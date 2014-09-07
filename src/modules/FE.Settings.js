;(function(FE, window, undefined) {

	"use strict";

	FE.Settings = {

		numWorkers: 8,
		renderer: "Canvas",
		fractal: "Mandelbrot",
		preset: "None",

		coordinates: { x: 0, y: 0, z: 4 },
		offset: { x: 0, y: 0, },
		position: { x: 0, y: 0 },

		resolution: {
			factor: 1,
			steps: 4,
			iterations: 100,
			buddhaEscape: 200,
			renderOnDrag: true
		},
		
		shading: {
			smooth: true,
			scale: 0.3,
			color: {
				scale: { r: 1, g: 1, b: 1 },

				shift: {
					r: Math.sin(200.2),
					g: Math.sin(320.2),
					b: Math.sin(440.2)
				}
			}
		},
		
		isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
	};

}(window.FE || {}, window));