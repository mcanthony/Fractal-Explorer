;(function(FE, window, undefined) {

	"use strict";

	FE.Settings = {

		renderer: "Canvas",
		fractal: "Mandelbrot",
		preset: "None",

		iterations: 100,
		coordinates: { x: 0, y: 0, z: 4 },
		position: { x: 0.34288121314237574, y: 0.0455005055611728 },
		resolution: { factor: 1, steps: 4 },
		
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