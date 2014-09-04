precision mediump float;

uniform vec2 uResolution;
uniform vec3 uCoordinates;
uniform vec2 uPosition;
uniform vec3 uColorScale;
uniform vec3 uColorShift;
uniform float uShadingScale;
uniform float uIterations;
uniform float uSmoothShading;

void main()
{
    vec2 z = vec2(0);
	vec2 c = (gl_FragCoord.xy/uResolution.xy-0.5) * uCoordinates.z * vec2(1,uResolution.y/uResolution.x);
   
    float n = 0.0;

	for(float i=0.0;i<1000.0;i+=1.0)
	{
		z = vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c+uCoordinates.xy*vec2(1,-1);
        n = z.x*z.x+z.y*z.y;
        
        if(n>128.0||i>uIterations)
        {
            if (uSmoothShading>0.0)
            n = i>0.0?(i-log2(log2(z.x*z.x+z.y*z.y)))*uShadingScale:0.0;
            else
            n = i>0.0?(1000.0-i+101.0)*uShadingScale:0.0;
            gl_FragColor=vec4(sin((n+uColorShift)*uColorScale),1);
            break;
        }
	}
}