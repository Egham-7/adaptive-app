"use client";

import { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";

const vertex = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Green/Emerald aurora flow shader
const fragment = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;

#define PI 3.14159265359

// Simplex-style noise (fast fake)
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
           (c - a)*u.y*(1.0 - u.x) +
           (d - b)*u.x*u.y;
}

// Green/Emerald gradient palette
vec3 gradient(float t) {
    vec3 deepGreen = vec3(0.02, 0.3, 0.26);    // Deep emerald
    vec3 emerald = vec3(0.063, 0.725, 0.506);  // #10b981
    vec3 lime = vec3(0.639, 0.902, 0.208);     // #a3e635
    
    if (t < 0.5) {
        return mix(deepGreen, emerald, t * 2.0);
    } else {
        return mix(emerald, lime, (t - 0.5) * 2.0);
    }
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    uv -= 0.5;
    uv.x *= uResolution.x / uResolution.y;

    // Distort UVs with animated noise
    float n = noise(uv * 2.0 + uTime * 0.15);
    float m = noise(uv * 4.0 - uTime * 0.1);

    float t = 0.5 + 0.5 * sin(uTime * 0.3 + n * 2.5);
    vec3 col = gradient(t + m * 0.3);

    // Soft glow effect
    float d = length(uv);
    col += vec3(0.1, 0.3, 0.2) / (d * 3.0 + 0.2);

    // Darken edges for vignette
    col *= 1.0 - d * 0.5;

    gl_FragColor = vec4(col, 1.0);
}
`;

type Props = {
	resolutionScale?: number;
	className?: string;
};

export default function AuroraFlow({
	resolutionScale = 1.0,
	className,
}: Props) {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current as HTMLCanvasElement;
		const parent = canvas.parentElement as HTMLElement;

		const renderer = new Renderer({
			dpr: Math.min(window.devicePixelRatio, 2),
			canvas,
		});

		const gl = renderer.gl;
		const geometry = new Triangle(gl);

		const program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				uTime: { value: 0 },
				uResolution: { value: new Vec2() },
			},
		});

		const mesh = new Mesh(gl, { geometry, program });

		const resize = () => {
			const w = parent.clientWidth,
				h = parent.clientHeight;
			renderer.setSize(w * resolutionScale, h * resolutionScale);
			program.uniforms.uResolution.value.set(w, h);
		};

		window.addEventListener("resize", resize);
		resize();

		const start = performance.now();
		let frame = 0;

		const loop = () => {
			program.uniforms.uTime.value = (performance.now() - start) / 1000;
			renderer.render({ scene: mesh });
			frame = requestAnimationFrame(loop);
		};

		loop();

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
		};
	}, [resolutionScale]);

	return <canvas ref={ref} className={`w-full h-full block ${className}`} />;
}
