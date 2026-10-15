"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useAceleracao } from "./aceleracao";
import { useMovimentoReduzido } from "@/lib/movimento";

/*
 * ============================================================================
 * FLUXO DE CETIM — porte do "Satin Flow" do Originkit (originkit.dev)
 * ============================================================================
 *
 * Fundo animado: ruído fractal (FBM, 4 oitavas) dobrado sobre si mesmo três
 * vezes, que produz dobras de tecido em movimento lento. Bem mais barato que o
 * vidro líquido — é uma quad de tela cheia sem marcha de raios.
 *
 * O shader é o original, termo a termo. O que mudou:
 *
 * 1. TAMANHO MÍNIMO REMOVIDO. O original fixava 1200x800 no host, herança do
 *    Framer, que quebraria qualquer layout responsivo.
 *
 * 2. As props `width`/`height` do Framer saíram. Aqui o elemento preenche o
 *    que receber e o `ResizeObserver` mede o que existe de fato.
 *
 * 3. CORES pelos TOKENS, e re-resolvidas quando o tema muda. As três cores
 *    padrão são superfície + dois passos da marca, que já invertem sozinhos
 *    entre claro e escuro.
 *
 * 4. `prefers-reduced-motion`: o relógio do shader congela. O desenho continua
 *    (o degradê é a peça), mas as dobras param de andar.
 *
 * 5. PAUSA fora da viewport e em aba de fundo.
 *
 * 6. Resolução limitada a 1,5x. É um fundo desfocado por natureza: renderizar
 *    em 2x custa 78% mais pixels que ninguém consegue distinguir.
 *
 * 7. O `blur` opcional saiu. Era um `backdrop-filter` cobrindo a peça inteira,
 *    e sobrepor desfoque de fundo a um shader animado é a combinação mais cara
 *    que existe — cada quadro obriga o navegador a recompor a camada toda.
 */

const VS = `
attribute vec4 a_position;
void main() { gl_Position = a_position; }
`;

const FS = `
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

/**
 * Qualquer cor que o CSS entenda vira RGB 0..1, via canvas 1x1.
 *
 * O original lia só `#hex` e `rgb()`. O tema aqui é `oklch()` e chega por
 * variável, então quem resolve é o navegador.
 */
function resolverCor(cor: string | undefined, reserva: RGB): RGB {
  if (!cor || typeof document === "undefined") return reserva;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return reserva;
  try {
    ctx.fillStyle = "#000";
    ctx.fillStyle = cor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  } catch {
    return reserva;
  }
}

function lerToken(nome: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  return valor || undefined;
}

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
  const s = gl.createShader(tipo);
  if (!s) return null;
  gl.shaderSource(s, fonte);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("FluxoCetim shader:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/*
 * As três cores padrão saem dos tokens e funcionam nos dois temas sem ajuste:
 * no escuro a escala da marca é invertida, então `brand-50` é um roxo profundo
 * e no claro é uma lavanda pálida — nos dois casos, um passo acima da
 * superfície.
 */
const TOKENS_PADRAO = ["--color-surface-muted", "--color-brand-50", "--color-brand-200"] as const;

export function FluxoCetim({
  cores,
  /** Velocidade das dobras, em porcento (100 = 1x). */
  velocidade = 300,
  /** Escala do padrão, em porcento. Valores baixos dão dobras largas. */
  escala = 20,
  /** Granulado, em porcento. */
  granulado = 30,
  /** Deixa as dobras reagirem ao ponteiro. */
  interativo = true,
  className,
  style,
}: {
  cores?: [string, string, string];
  velocidade?: number;
  escala?: number;
  granulado?: number;
  interativo?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduzido = useMovimentoReduzido();
  const aceleracao = useAceleracao();

  const vivo = useRef({ cores, velocidade, escala, granulado, interativo, reduzido });
  useEffect(() => {
    vivo.current = { cores, velocidade, escala, granulado, interativo, reduzido };
  });

  useEffect(() => {
    // Renderização por software não dá conta de um shader de tela cheia; ver
    // `aceleracao.ts`. Sem GPU, o canvas fica vazio e o fundo do tema aparece.
    if (aceleracao !== "disponivel") return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const contexto = canvas.getContext("webgl", { antialias: false });
    if (!contexto) return;
    const gl: WebGLRenderingContext = contexto;

    const vs = compilar(gl, gl.VERTEX_SHADER, VS);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const programa = gl.createProgram();
    if (!programa) return;
    gl.attachShader(programa, vs);
    gl.attachShader(programa, fs);
    gl.linkProgram(programa);
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
      console.warn("FluxoCetim link:", gl.getProgramInfoLog(programa));
      return;
    }
    gl.useProgram(programa);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(programa, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      resolution: gl.getUniformLocation(programa, "iResolution"),
      time: gl.getUniformLocation(programa, "iTime"),
      mouse: gl.getUniformLocation(programa, "iMouse"),
      mouseStrength: gl.getUniformLocation(programa, "iMouseStrength"),
      color1: gl.getUniformLocation(programa, "uColor1"),
      color2: gl.getUniformLocation(programa, "uColor2"),
      color3: gl.getUniformLocation(programa, "uColor3"),
      speed: gl.getUniformLocation(programa, "uSpeed"),
      scale: gl.getUniformLocation(programa, "uScale"),
      noise: gl.getUniformLocation(programa, "uNoiseIntensity"),
      interactive: gl.getUniformLocation(programa, "uInteractive"),
    };

    let naTela = true;
    let abaVisivel = typeof document === "undefined" || !document.hidden;

    /* ---- cores: resolvidas uma vez, e de novo quando o tema vira ---- */
    let paleta: [RGB, RGB, RGB] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    function resolverPaleta() {
      const p = vivo.current;
      paleta = [0, 1, 2].map((i) =>
        resolverCor(p.cores?.[i] ?? lerToken(TOKENS_PADRAO[i]), [0, 0, 0]),
      ) as [RGB, RGB, RGB];
    }
    resolverPaleta();

    /*
     * O tema vira trocando `data-theme` no <html>. Sem observar isso, o fundo
     * ficaria com a paleta do tema anterior até a próxima montagem.
     */
    const observadorTema = new MutationObserver(resolverPaleta);
    observadorTema.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    /* ---- tamanho ---- */
    let bw = 1;
    let bh = 1;

    function redimensionar() {
      // 1,5 e não 2: o padrão é difuso e ninguém distingue a diferença, mas
      // são 78% mais pixels por quadro.
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

    const observadorTamanho = new ResizeObserver(redimensionar);
    observadorTamanho.observe(canvas);
    redimensionar();

    const observadorVista = new IntersectionObserver(
      ([entrada]) => {
        naTela = entrada.isIntersecting;
      },
      { threshold: 0.01 },
    );
    observadorVista.observe(canvas);

    const aoTrocarAba = () => {
      abaVisivel = !document.hidden;
    };
    document.addEventListener("visibilitychange", aoTrocarAba);

    /* ---- ponteiro ---- */
    const ponteiro = { x: 0, y: 0, alvoX: 0, alvoY: 0 };
    const forca = { valor: 0, alvo: 0 };

    const aoMover = (e: PointerEvent) => {
      if (!vivo.current.interativo) return;
      const r = canvas.getBoundingClientRect();
      ponteiro.alvoX = e.clientX - r.left;
      // O shader usa origem embaixo; a caixa do DOM, em cima.
      ponteiro.alvoY = r.height - (e.clientY - r.top);
    };
    const aoEntrar = () => {
      if (vivo.current.interativo) forca.alvo = 1;
    };
    const aoSair = () => {
      forca.alvo = 0;
    };

    canvas.addEventListener("pointermove", aoMover);
    canvas.addEventListener("pointerenter", aoEntrar);
    canvas.addEventListener("pointerleave", aoSair);

    /* ---- laço ---- */
    const inicio = performance.now();
    let quadro = 0;
    let relogio = 0;
    let anterior = inicio;

    function desenhar(agora: number) {
      const p = vivo.current;
      const dt = Math.min((agora - anterior) / 1000, 0.05);
      anterior = agora;

      // Com movimento reduzido o relógio para: o degradê continua na tela,
      // mas as dobras não andam.
      if (!p.reduzido) relogio += dt;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      // Suavização do ponteiro — é o que dá inércia ao empurrão.
      ponteiro.x += (ponteiro.alvoX - ponteiro.x) * 0.08;
      ponteiro.y += (ponteiro.alvoY - ponteiro.y) * 0.08;
      forca.valor += (forca.alvo - forca.valor) * 0.08;

      gl.uniform2f(u.resolution, bw, bh);
      gl.uniform1f(u.time, relogio);
      gl.uniform2f(u.mouse, ponteiro.x * dpr, ponteiro.y * dpr);
      gl.uniform1f(u.mouseStrength, forca.valor);

      gl.uniform3f(u.color1, paleta[0][0], paleta[0][1], paleta[0][2]);
      gl.uniform3f(u.color2, paleta[1][0], paleta[1][1], paleta[1][2]);
      gl.uniform3f(u.color3, paleta[2][0], paleta[2][1], paleta[2][2]);
      gl.uniform1f(u.speed, p.velocidade / 100);
      gl.uniform1f(u.scale, p.escala / 100);
      gl.uniform1f(u.noise, p.granulado / 100);
      gl.uniform1f(u.interactive, p.interativo ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function laco(agora: number) {
      quadro = requestAnimationFrame(laco);
      if (!naTela || !abaVisivel) {
        anterior = agora;
        return;
      }
      desenhar(agora);
    }
    quadro = requestAnimationFrame(laco);

    return () => {
      cancelAnimationFrame(quadro);
      observadorTamanho.disconnect();
      observadorVista.disconnect();
      observadorTema.disconnect();
      document.removeEventListener("visibilitychange", aoTrocarAba);
      canvas.removeEventListener("pointermove", aoMover);
      canvas.removeEventListener("pointerenter", aoEntrar);
      canvas.removeEventListener("pointerleave", aoSair);
    };
  }, [aceleracao]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
