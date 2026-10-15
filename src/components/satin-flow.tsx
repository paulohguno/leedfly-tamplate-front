"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useAcceleration } from "@/lib/acceleration";
import { useReducedMotion } from "@/lib/motion";

const VERTEX_SHADER = `
attribute vec4 a_position;
void main() { gl_Position = a_position; }
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform float iMouseStrength;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uSpeed;
uniform float uScale;
uniform float uNoiseIntensity;
uniform float uInteractive;

vec3 hash(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash(i + vec3(0.0,0.0,0.0)), f - vec3(0.0,0.0,0.0)),
                       dot(hash(i + vec3(1.0,0.0,0.0)), f - vec3(1.0,0.0,0.0)), u.x),
                   mix(dot(hash(i + vec3(0.0,1.0,0.0)), f - vec3(0.0,1.0,0.0)),
                       dot(hash(i + vec3(1.0,1.0,0.0)), f - vec3(1.0,1.0,0.0)), u.x), u.y),
               mix(mix(dot(hash(i + vec3(0.0,0.0,1.0)), f - vec3(0.0,0.0,1.0)),
                       dot(hash(i + vec3(1.0,0.0,1.0)), f - vec3(1.0,0.0,1.0)), u.x),
                   mix(dot(hash(i + vec3(0.0,1.0,1.0)), f - vec3(0.0,1.0,1.0)),
                       dot(hash(i + vec3(1.0,1.0,1.0)), f - vec3(1.0,1.0,1.0)), u.x), u.y), u.z);
}

float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);

    vec2 mouseUV = (2.0 * iMouse - iResolution.xy) / min(iResolution.x, iResolution.y);
    float mouseDist = length(p - mouseUV);
    float interact = exp(-mouseDist * mouseDist * 3.5) * iMouseStrength * uInteractive;

    p += (p - mouseUV) / (mouseDist + 0.001) * interact * 0.18;

    float t = iTime * uSpeed * 0.05;

    float scale = uScale * 2.2;
    vec3 p3 = vec3(p * scale, t);

    float n1 = fbm(p3);
    float n2 = fbm(p3 + vec3(n1 * 1.5, n1 * 1.2, 0.5));
    float n3 = fbm(p3 + vec3(n2 * 2.0, n2 * 1.0, 0.8));

    float pattern = 0.5 + 0.5 * sin(p.y * scale + n3 * 6.28);

    float shadow = clamp(n3 * 1.1, -0.5, 0.5);
    float highlight = pow(max(0.0, 1.0 - abs(n2)), 3.5) * 0.42;

    vec3 baseCol = mix(uColor1, uColor2, clamp(pattern + shadow, 0.0, 1.0));
    baseCol = mix(baseCol, uColor3, clamp(n1 * 1.4 + 0.5, 0.0, 1.0));

    vec3 col = baseCol + vec3(highlight) + vec3(interact * 0.08);

    float rnd = fract(sin(dot(fragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col -= (rnd - 0.5) * 0.04 * uNoiseIntensity;

    col = clamp(col, 0.0, 1.0);
    fragColor = vec4(col, 1.0);
}

void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
`;

type RGB = [number, number, number];

function resolveColor(color: string | undefined, fallback: RGB): RGB {
  if (!color || typeof document === "undefined") return fallback;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  try {
    ctx.fillStyle = "#000";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  } catch {
    return fallback;
  }
}

function readToken(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || undefined;
}

function compile(gl: WebGLRenderingContext, kind: number, source: string) {
  const shader = gl.createShader(kind);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("SatinFlow shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const DEFAULT_TOKENS = ["--color-surface-muted", "--color-brand-50", "--color-brand-200"] as const;

export function SatinFlow({
  colors,
  speed = 300,
  scale = 20,
  grain = 30,
  interactive = true,
  className,
  style,
}: {
  colors?: [string, string, string];
  speed?: number;
  scale?: number;
  grain?: number;
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const acceleration = useAcceleration();

  const live = useRef({ colors, speed, scale, grain, interactive, reduced });
  useEffect(() => {
    live.current = { colors, speed, scale, grain, interactive, reduced };
  });

  useEffect(() => {
    if (acceleration !== "available") return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const context = canvas.getContext("webgl", { antialias: false });
    if (!context) return;
    const gl: WebGLRenderingContext = context;

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("SatinFlow link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, "iResolution"),
      time: gl.getUniformLocation(program, "iTime"),
      mouse: gl.getUniformLocation(program, "iMouse"),
      mouseStrength: gl.getUniformLocation(program, "iMouseStrength"),
      color1: gl.getUniformLocation(program, "uColor1"),
      color2: gl.getUniformLocation(program, "uColor2"),
      color3: gl.getUniformLocation(program, "uColor3"),
      speed: gl.getUniformLocation(program, "uSpeed"),
      scale: gl.getUniformLocation(program, "uScale"),
      noise: gl.getUniformLocation(program, "uNoiseIntensity"),
      interactive: gl.getUniformLocation(program, "uInteractive"),
    };

    let onScreen = true;
    let tabVisible = typeof document === "undefined" || !document.hidden;

    let palette: [RGB, RGB, RGB] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    function resolvePalette() {
      const p = live.current;
      palette = [0, 1, 2].map((i) =>
        resolveColor(p.colors?.[i] ?? readToken(DEFAULT_TOKENS[i]), [0, 0, 0]),
      ) as [RGB, RGB, RGB];
    }
    resolvePalette();

    const themeObserver = new MutationObserver(resolvePalette);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let bw = 1;
    let bh = 1;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cw = canvas.clientWidth || 1;
      const ch = canvas.clientHeight || 1;
      const w = Math.max(1, Math.round(cw * dpr));
      const h = Math.max(1, Math.round(ch * dpr));
      if (w === bw && h === bh) return;
      bw = w;
      bh = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    resize();

    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    viewObserver.observe(canvas);

    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const strength = { value: 0, target: 0 };

    const onMove = (e: PointerEvent) => {
      if (!live.current.interactive) return;
      const r = canvas.getBoundingClientRect();
      pointer.targetX = e.clientX - r.left;
      pointer.targetY = r.height - (e.clientY - r.top);
    };
    const onPointerEnter = () => {
      if (live.current.interactive) strength.target = 1;
    };
    const onPointerLeave = () => {
      strength.target = 0;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const start = performance.now();
    let frameId = 0;
    let clock = 0;
    let previous = start;

    function draw(now: number) {
      const p = live.current;
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      if (!p.reduced) clock += dt;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      strength.value += (strength.target - strength.value) * 0.08;

      gl.uniform2f(uniforms.resolution, bw, bh);
      gl.uniform1f(uniforms.time, clock);
      gl.uniform2f(uniforms.mouse, pointer.x * dpr, pointer.y * dpr);
      gl.uniform1f(uniforms.mouseStrength, strength.value);

      gl.uniform3f(uniforms.color1, palette[0][0], palette[0][1], palette[0][2]);
      gl.uniform3f(uniforms.color2, palette[1][0], palette[1][1], palette[1][2]);
      gl.uniform3f(uniforms.color3, palette[2][0], palette[2][1], palette[2][2]);
      gl.uniform1f(uniforms.speed, p.speed / 100);
      gl.uniform1f(uniforms.scale, p.scale / 100);
      gl.uniform1f(uniforms.noise, p.grain / 100);
      gl.uniform1f(uniforms.interactive, p.interactive ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function loop(now: number) {
      frameId = requestAnimationFrame(loop);
      if (!onScreen || !tabVisible) {
        previous = now;
        return;
      }
      draw(now);
    }
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [acceleration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
