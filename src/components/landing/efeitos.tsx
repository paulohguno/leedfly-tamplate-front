"use client";

import {
  Fragment,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cx } from "@/lib/format";
import { useMovimentoReduzido } from "@/lib/movimento";
import { sorteio, useNaTela } from "./movimento";

/* ------------------------------------------------------------------ *
 * Peças de movimento da landing. Todas escrevem no DOM por variável CSS
 * (nunca por estado React a cada quadro) e todas respeitam
 * `prefers-reduced-motion` — pelo CSS global ou pelo hook.
 * ------------------------------------------------------------------ */

/**
 * Card que inclina em 3D na direção do cursor, com um reflexo de luz que
 * acompanha o ponteiro. O gesto dos cards de capacete do landonorris.com:
 * o card parece um objeto na mão, não um retângulo na tela.
 *
 * A inclinação vai para `--rx`/`--ry` e o reflexo para `--gx`/`--gy`; o CSS
 * (`.inclinavel` em globals.css) faz o resto. No toque não há ponteiro
 * flutuante, então o card simplesmente fica reto.
 */
export function Inclinavel({
  children,
  className,
  intensidade = 10,
  style,
}: {
  children: ReactNode;
  className?: string;
  /** Graus máximos de inclinação em cada eixo. */
  intensidade?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function aoMover(evento: PointerEvent<HTMLDivElement>) {
    const no = ref.current;
    if (!no || evento.pointerType === "touch") return;
    const caixa = no.getBoundingClientRect();
    const x = (evento.clientX - caixa.left) / caixa.width;
    const y = (evento.clientY - caixa.top) / caixa.height;
    no.style.setProperty("--ry", `${(x - 0.5) * intensidade * 2}deg`);
    no.style.setProperty("--rx", `${(0.5 - y) * intensidade * 2}deg`);
    no.style.setProperty("--gx", `${x * 100}%`);
    no.style.setProperty("--gy", `${y * 100}%`);
    no.dataset.ativo = "true";
  }

  function aoSair() {
    const no = ref.current;
    if (!no) return;
    no.style.setProperty("--rx", "0deg");
    no.style.setProperty("--ry", "0deg");
    no.dataset.ativo = "false";
  }

  return (
    <div
      ref={ref}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
      className={cx("inclinavel", className)}
      style={style}
    >
      {children}
      <span aria-hidden className="inclinavel-brilho" />
    </div>
  );
}

/**
 * Botão (ou qualquer coisa) atraído pelo cursor. Puxa até `forca` px na
 * direção do ponteiro e volta com mola ao sair.
 */
export function Magnetico({
  children,
  className,
  forca = 10,
}: {
  children: ReactNode;
  className?: string;
  forca?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  function aoMover(evento: PointerEvent<HTMLSpanElement>) {
    const no = ref.current;
    if (!no || evento.pointerType === "touch") return;
    const caixa = no.getBoundingClientRect();
    const dx = (evento.clientX - (caixa.left + caixa.width / 2)) / (caixa.width / 2);
    const dy = (evento.clientY - (caixa.top + caixa.height / 2)) / (caixa.height / 2);
    no.style.transform = `translate3d(${dx * forca}px, ${dy * forca * 0.6}px, 0)`;
  }

  function aoSair() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <span
      ref={ref}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
      className={cx("magnetico inline-flex", className)}
    >
      {children}
    </span>
  );
}

/**
 * Título que sobe palavra por palavra de trás de uma máscara — o corte de
 * abertura dos vídeos da marca. `destaque` recebe os índices das palavras
 * pintadas com o degradê da marca.
 */
export function TituloCinetico({
  texto,
  destaque = [],
  como: Como = "h2",
  className,
  atraso = 0,
  imediato,
}: {
  texto: string;
  destaque?: number[];
  como?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Atraso inicial em ms. */
  atraso?: number;
  /** Anima já na montagem (primeira dobra), sem esperar o observador. */
  imediato?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const naTela = useNaTela(ref, { limiar: 0.2 });
  const palavras = texto.split(" ");

  return (
    <Como
      ref={ref}
      aria-label={texto}
      data-visivel={imediato || naTela}
      className={cx("cinetico", className)}
      style={{ "--atraso": `${atraso}ms` } as CSSProperties}
    >
      {palavras.map((palavra, i) => (
        // O espaço fica fora da máscara: dentro de um inline-block o espaço
        // final da linha é descartado e as palavras grudariam.
        <Fragment key={i}>
          <span aria-hidden className="cinetico-mascara">
            <span
              className={cx(
                "cinetico-palavra",
                destaque.includes(i) &&
                  "bg-linear-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent",
              )}
              style={{ "--i": i } as CSSProperties}
            >
              {palavra}
            </span>
          </span>
          {i < palavras.length - 1 && " "}
        </Fragment>
      ))}
    </Como>
  );
}

/**
 * Rótulo de capítulo: "— 01 · ENCONTRE CLIENTES", em mono, como nos vídeos.
 * O traço cresce da esquerda quando entra na tela.
 */
export function Rotulo({ numero, children }: { numero?: string; children: ReactNode }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const naTela = useNaTela(ref);
  return (
    <p
      ref={ref}
      data-visivel={naTela}
      className="rotulo-capitulo flex items-center gap-3 font-mono text-[11px] font-medium tracking-[0.22em] text-brand-500 uppercase"
    >
      <span aria-hidden className="rotulo-traco h-px w-8 bg-brand-500" />
      {numero && <span className="tabular-nums">{numero}</span>}
      {numero && <span aria-hidden>·</span>}
      <span>{children}</span>
    </p>
  );
}

/**
 * Faixa infinita. O conteúdo é duplicado e a trilha anda -50%: quando a
 * segunda cópia chega onde a primeira estava, o loop recomeça sem costura.
 */
export function Letreiro({
  children,
  duracao = 40,
  reverso,
  className,
}: {
  children: ReactNode;
  duracao?: number;
  reverso?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("letreiro group/letreiro", className)}>
      <div
        className="letreiro-trilha"
        style={
          {
            "--duracao": `${duracao}s`,
            animationDirection: reverso ? "reverse" : undefined,
          } as CSSProperties
        }
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Campo de estrelas em canvas — o fundo dos vídeos da Leedfly. Cada estrela
 * cintila na própria fase e o campo inteiro desliza um pouco na direção do
 * cursor (paralaxe por profundidade).
 *
 * A cor é a do texto (`--color-ink`): no escuro vira poeira clara, no claro
 * vira grafite — sem condicional de tema. Pausa fora da tela e em aba oculta.
 */
export function CampoEstrelas({
  quantidade = 160,
  className,
  semente = 7,
}: {
  quantidade?: number;
  className?: string;
  semente?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduzido = useMovimentoReduzido();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rnd = sorteio(semente);
    const estrelas = Array.from({ length: quantidade }, () => ({
      x: rnd(),
      y: rnd(),
      z: 0.2 + rnd() * 0.8,
      r: 0.4 + rnd() * 1.1,
      fase: rnd() * Math.PI * 2,
      ritmo: 0.6 + rnd() * 1.6,
    }));

    let cor = "#fff";
    let corMarca = "#a855f7";
    function lerCores() {
      const estilo = getComputedStyle(document.documentElement);
      cor = estilo.getPropertyValue("--color-ink").trim() || cor;
      corMarca = estilo.getPropertyValue("--color-brand-500").trim() || corMarca;
    }
    lerCores();
    const vigiaTema = new MutationObserver(lerCores);
    vigiaTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let largura = 0;
    let altura = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function medir() {
      const caixa = canvas!.getBoundingClientRect();
      largura = caixa.width;
      altura = caixa.height;
      canvas!.width = Math.round(largura * dpr);
      canvas!.height = Math.round(altura * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    medir();
    const vigiaTamanho = new ResizeObserver(medir);
    vigiaTamanho.observe(canvas);

    let alvoX = 0;
    let alvoY = 0;
    let px = 0;
    let py = 0;
    function aoMover(e: globalThis.PointerEvent) {
      alvoX = e.clientX / window.innerWidth - 0.5;
      alvoY = e.clientY / window.innerHeight - 0.5;
    }
    window.addEventListener("pointermove", aoMover, { passive: true });

    let visivel = true;
    const vigiaTela = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !quadro) quadro = requestAnimationFrame(desenhar);
    });
    vigiaTela.observe(canvas);

    let quadro = 0;
    function desenhar(agora: number) {
      quadro = 0;
      const t = reduzido ? 0 : agora / 1000;
      px += (alvoX - px) * 0.04;
      py += (alvoY - py) * 0.04;
      ctx!.clearRect(0, 0, largura, altura);
      for (let i = 0; i < estrelas.length; i++) {
        const e = estrelas[i];
        const brilho = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * e.ritmo + e.fase));
        const x = ((e.x * largura - px * 40 * e.z + t * 4 * e.z) % largura + largura) % largura;
        const y = e.y * altura - py * 30 * e.z;
        ctx!.globalAlpha = brilho * e.z * 0.85;
        ctx!.fillStyle = i % 9 === 0 ? corMarca : cor;
        ctx!.beginPath();
        ctx!.arc(x, y, e.r * e.z, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      if (visivel && !document.hidden && !reduzido) quadro = requestAnimationFrame(desenhar);
    }
    quadro = requestAnimationFrame(desenhar);

    function aoVoltarAba() {
      if (!document.hidden && visivel && !quadro) quadro = requestAnimationFrame(desenhar);
    }
    document.addEventListener("visibilitychange", aoVoltarAba);

    return () => {
      if (quadro) cancelAnimationFrame(quadro);
      vigiaTema.disconnect();
      vigiaTamanho.disconnect();
      vigiaTela.disconnect();
      window.removeEventListener("pointermove", aoMover);
      document.removeEventListener("visibilitychange", aoVoltarAba);
    };
  }, [quantidade, semente, reduzido]);

  return <canvas ref={ref} aria-hidden className={cx("pointer-events-none size-full", className)} />;
}
