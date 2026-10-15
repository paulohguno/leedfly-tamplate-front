"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  IconeCapturas,
  IconeCiclo,
  IconeEmpresa,
  IconeEquipe,
  IconeEtiqueta,
  IconeGrade,
  IconeMapa,
  IconeSubir,
  IconeTelefone,
  IconeWhatsapp,
} from "@/components/layout/icones";
import { useMovimentoReduzido } from "@/lib/movimento";
import { cx } from "@/lib/format";
import { Inclinavel } from "./efeitos";
import { TituloSplit } from "./cinema/titulo-split";
import { limitar, progressoDaSecao } from "./movimento";

function fotoUnsplash(id: string, largura: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${largura}&q=80`;
}

type Card =
  | {
      tipo: "foto";
      foto: string;
      alt: string;
      local: string;
      titulo: string;
      texto: string;
      Icone: typeof IconeSubir;
    }
  | { tipo: "recurso"; titulo: string; texto: string; Icone: typeof IconeSubir; visual: ReactNode };

/*
 * O que a Leedfly é e o que a pessoa consegue com ela — em linguagem de
 * resultado, não de recurso. Os recursos em detalhe já aparecem no palco do
 * produto e no bento; aqui cada card responde "e eu com isso?".
 */
const CARDS: Card[] = [
  {
    tipo: "recurso",
    titulo: "Clientes vêm até você",
    texto:
      "A Leedfly encontra empresas para você vender, organiza tudo e mostra quem chamar primeiro.",
    Icone: IconeCapturas,
    visual: <VisualAtracao />,
  },
  {
    tipo: "foto",
    foto: fotoUnsplash("1552664730-d307ca884978", 800),
    alt: "Equipe comercial reunida planejando a semana",
    local: "Vendas",
    titulo: "Mais tempo vendendo",
    texto:
      "Menos tempo procurando clientes. Mais tempo conversando com quem pode comprar.",
    Icone: IconeEquipe,
  },
  {
    tipo: "recurso",
    titulo: "Para qualquer segmento",
    texto: "Se você vende para empresas, compatível com o seu perfilA Leedfly encontra os melhores clientes para você.",
    Icone: IconeEmpresa,
    visual: <VisualSegmentos />,
  },
  {
    tipo: "recurso",
    titulo: "Seu cliente ideal",
    texto: "Que tipo de lead você procura? A Leedfly encontra os melhores para o seu negócio.",
    Icone: IconeEtiqueta,
    visual: <VisualClienteIdeal />,
  },
  {
    tipo: "recurso",
    titulo: "Horas viram minutos",
    texto: "A pesquisa que tomava uma tarde inteira fica pronta enquanto você toma um café.",
    Icone: IconeCiclo,
    visual: <VisualRelogio />,
  },
  {
    tipo: "foto",
    foto: fotoUnsplash("1600880292203-757bb62b4baf", 800),
    alt: "Dupla analisando o mapa de clientes da região",
    local: "Mercado",
    titulo: "Cresça na sua região",
    texto: "Descubra quais cidades estão os clientes que mais combinam com você.",
    Icone: IconeMapa,
  },
  {
    tipo: "recurso",
    titulo: "Contato pronto para chamar",
    texto: "Telefone, WhatsApp e endereço conferidos, direto no seu lead",
    Icone: IconeTelefone,
    visual: <VisualContato />,
  },
  {
    tipo: "recurso",
    titulo: "Adeus, planilha",
    texto: "Tudo o que vivia espalhado em planilhas agora fica organizado num lugar só.",
    Icone: IconeGrade,
    visual: <VisualPlanilha />,
  },
  {
    tipo: "recurso",
    titulo: "Comece hoje",
    texto: "Crie sua conta e comece a encontrar clientes hoje.",
    Icone: IconeSubir,
    visual: <VisualComece />,
  },
];

/** Inclinação de repouso de cada card — o "monte jogado na mesa". */
const GIROS = [-7, 5, -4, 8, -6, 4, -8, 6, -5];

/**
 * Galeria presa no scroll, que corre na horizontal.
 *
 * No desktop a seção ganha altura igual ao percurso horizontal da trilha; o
 * palco gruda e o scroll vertical vira deslocamento lateral. Cada card tem
 * um giro de repouso e se endireita ao cruzar o centro da tela; a velocidade
 * do scroll entorta todos juntos, como um maço sendo puxado.
 *
 * No celular nada disso: a trilha vira um carrossel nativo com snap — o
 * dedo já é o melhor controle de rolagem horizontal que existe.
 */
export function GaleriaCards() {
  const secao = useRef<HTMLElement>(null);
  const trilha = useRef<HTMLDivElement>(null);
  const reduzido = useMovimentoReduzido();

  useEffect(() => {
    const no = secao.current;
    const pista = trilha.current;
    if (!no || !pista) return;
    const cards = Array.from(pista.querySelectorAll<HTMLElement>("[data-card]"));
    const desktop = window.matchMedia("(min-width: 768px)");

    let percurso = 0;
    let centros: number[] = [];
    let ativo = false;
    let quadro = 0;
    let xAnterior = 0;
    let velocidade = 0;

    function medir() {
      if (!desktop.matches) {
        no!.style.height = "";
        pista!.style.transform = "";
        cards.forEach((c) => (c.style.transform = ""));
        ativo = false;
        return;
      }
      percurso = Math.max(0, pista!.scrollWidth - window.innerWidth);
      no!.style.height = `${percurso + window.innerHeight}px`;
      centros = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
      ativo = true;
      agendar();
    }

    function quadroDeDesenho() {
      quadro = 0;
      if (!ativo) return;
      const p = progressoDaSecao(no!);
      const x = -p * percurso;
      const delta = x - xAnterior;
      xAnterior = x;
      velocidade += (delta - velocidade) * 0.18;
      no!.style.setProperty("--p", String(p));

      pista!.style.transform = `translate3d(${x}px, 0, 0)`;
      const meio = window.innerWidth / 2;
      const giroVelocidade = reduzido ? 0 : limitar(velocidade * 0.12, -10, 10);
      for (let i = 0; i < cards.length; i++) {
        const rel = (centros[i] + x - meio) / window.innerWidth;
        const dist = Math.min(1, Math.abs(rel) * 1.5);
        const giro = reduzido ? 0 : GIROS[i % GIROS.length] * dist;
        const y = reduzido ? 0 : dist * dist * 46 * (i % 2 ? 1 : -0.6);
        const escala = 1 - dist * 0.07;
        cards[i].style.transform =
          `translate3d(0, ${y}px, 0) rotate(${giro - giroVelocidade}deg) scale(${escala})`;
      }
      // Continua desenhando enquanto a inércia não assentar.
      if (Math.abs(velocidade) > 0.05) agendar();
    }

    function agendar() {
      if (!quadro) quadro = requestAnimationFrame(quadroDeDesenho);
    }

    medir();
    const aoRedimensionar = () => medir();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    desktop.addEventListener("change", aoRedimensionar);
    // Fotos que carregam depois mudam a largura da trilha.
    const vigia = new ResizeObserver(aoRedimensionar);
    vigia.observe(pista);

    return () => {
      if (quadro) cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", aoRedimensionar);
      desktop.removeEventListener("change", aoRedimensionar);
      vigia.disconnect();
    };
  }, [reduzido]);

  return (
    <section ref={secao} id="recursos" className="relative overflow-x-clip">
      <div className="flex flex-col justify-center py-20 md:sticky md:top-0 md:h-svh md:overflow-hidden md:py-0">
        <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-6 px-4 sm:px-6">
          <div>
            <TituloSplit className="mt-4 text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[0.98] font-bold tracking-[-0.035em] text-ink">
              O que a Leedfly <em>faz por você.</em>
            </TituloSplit>
          </div>
        </div>

        <div
          ref={trilha}
          className={cx(
            "mt-10 flex gap-6 px-4 pb-10 sm:px-6 md:mt-14 md:w-max md:gap-10 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] md:pb-0",
            "snap-x snap-mandatory overflow-x-auto md:snap-none md:overflow-visible",
            "will-change-transform",
          )}
        >
          {CARDS.map((card, i) => (
            <div key={card.titulo} data-card className="shrink-0 snap-center will-change-transform">
              <Inclinavel
                intensidade={9}
                className="h-[26rem] w-[17.5rem] rounded-3xl sm:w-[19rem]"
              >
                {card.tipo === "foto" ? (
                  <CardFoto card={card} i={i} />
                ) : (
                  <CardRecurso card={card} i={i} />
                )}
              </Inclinavel>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Indice({ i, claro }: { i: number; claro?: boolean }) {
  return (
    <span
      className={cx(
        "font-mono text-[11px] font-semibold tabular-nums",
        claro ? "text-white/70" : "text-ink-muted",
      )}
    >
      {String(i + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")}
    </span>
  );
}

function CardFoto({ card, i }: { card: Extract<Card, { tipo: "foto" }>; i: number }) {
  return (
    <article className="card-shadow group relative size-full overflow-hidden rounded-3xl">
      <Image
        src={card.foto}
        alt={card.alt}
        fill
        sizes="(min-width: 640px) 19rem, 17.5rem"
        draggable={false}
        className="scale-110 object-cover transition-transform duration-1000 ease-fluida group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-linear-to-t from-scrim via-scrim/40 to-scrim/10" />
      <div className="relative flex h-full flex-col justify-between p-6 text-white">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase backdrop-blur-md">
            {card.local}
          </span>
          <Indice i={i} claro />
        </div>
        <div>
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur-md transition-transform duration-500 ease-mola group-hover:scale-110 group-hover:-rotate-6">
            <card.Icone className="size-5.5" />
          </span>
          <h3 className="mt-4 text-2xl leading-tight font-bold tracking-tight">{card.titulo}</h3>
          <p className="texto-bonito mt-2 text-sm text-white/75">{card.texto}</p>
        </div>
      </div>
    </article>
  );
}

function CardRecurso({ card, i }: { card: Extract<Card, { tipo: "recurso" }>; i: number }) {
  return (
    <article className="vidro card-shadow group flex size-full flex-col overflow-hidden rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 transition-transform duration-500 ease-mola group-hover:scale-110 group-hover:rotate-6">
          <card.Icone className="size-5.5" />
        </span>
        <Indice i={i} />
      </div>
      <div className="relative my-5 flex flex-1 items-center justify-center">{card.visual}</div>
      <h3 className="text-xl leading-tight font-bold tracking-tight text-ink">{card.titulo}</h3>
      <p className="texto-bonito mt-2 text-sm leading-relaxed text-ink-muted">{card.texto}</p>
    </article>
  );
}

/* ---------------- Miniaturas animadas: cada uma conta o seu card ---------------- */

/** Ímã de clientes: pontos de fora da tela são puxados até o logo. */
function VisualAtracao() {
  const pontos = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.4;
    const r = 70 + (i % 3) * 14;
    return { dx: `${Math.round(Math.cos(a) * r)}px`, dy: `${Math.round(Math.sin(a) * r)}px` };
  });
  return (
    <div className="relative grid size-44 place-items-center">
      <div className="absolute inset-6 rounded-full bg-brand-500/15 blur-2xl" />
      <div className="absolute inset-3 rounded-full border border-dashed border-brand-500/25" />
      {pontos.map((p, i) => (
        <span
          key={i}
          className="gal-atrair gal-anima absolute size-2.5 rounded-full bg-brand-400 opacity-0 shadow-[0_0_10px_var(--color-brand-500)]"
          style={{ "--dx": p.dx, "--dy": p.dy, "--i": i } as CSSProperties}
        />
      ))}
      <span className="gal-nucleo gal-anima relative grid size-16 place-items-center rounded-2xl bg-surface shadow-[0_0_40px_-6px_var(--color-brand-500)] ring-1 ring-brand-500/40">
        <Image
          src="/logo-app-icon.png"
          alt=""
          width={40}
          height={40}
          className="size-10 rounded-xl"
        />
      </span>
    </div>
  );
}

/** Letreiro de segmentos: a palavra do meio troca, as vizinhas esmaecem. */
function VisualSegmentos() {
  // Primeira e última linhas repetem para o loop não ter costura.
  const lista = [
    "Academias",
    "Clínicas",
    "Escritórios",
    "Indústrias",
    "Lojas",
    "Academias",
    "Clínicas",
    "Escritórios",
  ];
  return (
    <div className="w-full">
      <div
        className="relative h-[8.25rem] overflow-hidden mask-[linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
        style={{ "--linha": "2.75rem" } as CSSProperties}
      >
        <div className="absolute inset-x-0 top-[2.75rem] h-[2.75rem] rounded-xl border border-brand-500/30 bg-brand-500/10" />
        <div className="gal-segmentos gal-anima relative">
          {lista.map((s, i) => (
            <p
              key={i}
              className="flex h-[2.75rem] items-center justify-center text-2xl font-bold tracking-tight text-ink"
            >
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Cliente ideal: as características acendem e a compatibilidade enche. */
function VisualClienteIdeal() {
  const etiquetas = ["Odontologia", "5 a 20 pessoas", "Curitiba + 15 km", "CNPJ ativo"];
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2">
        {etiquetas.map((e, i) => (
          <span
            key={e}
            className="gal-etiqueta gal-anima rounded-full border border-brand-500/55 bg-brand-500/12 px-3 py-1.5 text-xs font-semibold text-ink"
            style={{ "--i": i } as CSSProperties}
          >
            {e}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <span className="gal-compatibilidade gal-anima block h-full w-full rounded-full bg-linear-to-r from-brand-600 to-ok" />
        </span>
        <span className="text-sm font-bold text-ok tabular-nums">97%</span>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-ink-muted">compatível</p>
    </div>
  );
}

/** Relógio: o ponteiro dispara e "4 horas" vira "5 minutos". */
function VisualRelogio() {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-28" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-line)" strokeWidth="3" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="50"
            y1="10"
            x2="50"
            y2={i % 3 === 0 ? 17 : 14}
            stroke="var(--color-ink-muted)"
            strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
            strokeLinecap="round"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <g className="gal-ponteiro gal-anima" style={{ transformBox: "view-box" }}>
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            stroke="var(--color-brand-500)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="50" cy="50" r="4" fill="var(--color-brand-500)" />
      </svg>
      <div className="flex items-baseline gap-3">
        <span className="gal-tempo-antes gal-anima text-lg font-semibold text-ink-muted line-through decoration-2">
          4 horas
        </span>
        <span className="gal-tempo-depois gal-anima text-2xl font-bold text-brand-500">
          5 minutos
        </span>
      </div>
    </div>
  );
}

/** Contato: cada dado é conferido e ganha o seu visto. */
function VisualContato() {
  const dados = [
    { Icone: IconeTelefone, texto: "(41) 3352-0187" },
    { Icone: IconeWhatsapp, texto: "WhatsApp" },
    { Icone: IconeMapa, texto: "Rua XV de Novembro, 120" },
  ];
  return (
    <div className="w-full space-y-2">
      {dados.map(({ Icone, texto }, i) => (
        <div
          key={texto}
          className="flex items-center gap-2.5 rounded-xl border border-line/70 bg-surface/50 px-2.5 py-2.5 sm:gap-3 sm:px-3"
        >
          <Icone className="size-4 shrink-0 text-ink-muted" />
          {/* Menor no celular: o card é estreito e o endereço não cabia inteiro. */}
          <span className="min-w-0 flex-1 truncate text-xs text-ink sm:text-sm">{texto}</span>
          <span
            className="gal-visto gal-anima grid size-5 place-items-center rounded-full bg-ok text-surface"
            style={{ "--i": i } as CSSProperties}
          >
            <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
              <path
                d="M2.5 6.2 5 8.6l4.6-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Planilha: células jogadas se encaixam numa grade arrumada. */
function VisualPlanilha() {
  const cores = [
    "var(--color-brand-500)",
    "color-mix(in oklch, var(--color-brand-500) 55%, transparent)",
    "color-mix(in oklch, var(--color-brand-500) 30%, transparent)",
    "var(--color-ok)",
  ];
  const celulas = Array.from({ length: 16 }, (_, i) => {
    const s = Math.sin(i * 91.7) * 1000;
    const r = s - Math.floor(s);
    return {
      rx: `${Math.round((r - 0.5) * 70)}px`,
      ry: `${Math.round((((r * 7) % 1) - 0.5) * 60)}px`,
      rot: `${Math.round((r - 0.5) * 70)}deg`,
      cor: i % 4 === 0 ? cores[0] : i % 4 === 3 ? cores[3] : cores[i % 4],
    };
  });
  return (
    <div className="grid w-44 grid-cols-4 gap-2">
      {celulas.map((c, i) => (
        <span
          key={i}
          className="gal-celula gal-anima h-7 rounded-md"
          style={
            {
              "--rx": c.rx,
              "--ry": c.ry,
              "--rot": c.rot,
              "--cor": c.cor,
              "--i": i,
              backgroundColor: c.cor,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Comece hoje: três passos se completam e a barra enche. */
function VisualComece() {
  const passos = ["Crie a conta", "Descreva o seu negócio", "Faça a primeira busca"];
  return (
    <div className="w-full">
      <ol className="space-y-2.5">
        {passos.map((p, i) => (
          <li
            key={p}
            className="gal-passo gal-anima flex items-center gap-3"
            style={{ "--i": i } as CSSProperties}
          >
            <span className="grid size-6 place-items-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
              {i + 1}
            </span>
            <span className="text-sm font-medium text-ink">{p}</span>
          </li>
        ))}
      </ol>
      <span className="mt-5 block h-1.5 overflow-hidden rounded-full bg-line">
        <span className="gal-progresso gal-anima block h-full w-full rounded-full bg-brand-500" />
      </span>
    </div>
  );
}
