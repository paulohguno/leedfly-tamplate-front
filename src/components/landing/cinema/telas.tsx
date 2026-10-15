"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Contador } from "@/components/motion/contador";
import { cx, fmt } from "@/lib/format";
import {
  IconeBusca,
  IconeCapturas,
  IconeFiltro,
  IconeLeads,
  IconeMapa,
  IconePainel,
  IconeVisitantes,
  IconeWhatsapp,
} from "@/components/layout/icones";
import { AnelScore, Avatar, LEADS_DEMO } from "../pecas";
import { sorteio } from "../movimento";

/*
 * Telas do produto exibidas dentro do aparelho do palco. Prancheta fixa de
 * 800×500; quem escala é o palco. Cada tela recebe `ativo` e o repassa como
 * `data-ativo` — as entradas em cascata são as utilitárias `.item-cascata`
 * já existentes (globals.css), com o índice em `--i`.
 */

export const TELA = { largura: 800, altura: 500 } as const;

function Cascata({ i, className, children }: { i: number; className?: string; children: ReactNode }) {
  return (
    <div className={cx("item-cascata", className)} style={{ "--i": i } as CSSProperties}>
      {children}
    </div>
  );
}

function Moldura({
  ativo,
  menu,
  trilha,
  children,
}: {
  ativo: boolean;
  menu: number;
  trilha: string;
  children: ReactNode;
}) {
  return (
    <div data-ativo={ativo} className="carta-conteudo flex size-full bg-surface text-ink">
      <aside className="divisa flex w-14 shrink-0 flex-col items-center gap-4 border-r bg-surface-muted/60 pt-3.5">
        <Image src="/logo-app-icon.png" alt="" width={28} height={28} className="size-7 rounded-lg" />
        {[IconePainel, IconeCapturas, IconeLeads, IconeVisitantes].map((Ic, i) => (
          <span
            key={i}
            className={cx(
              "grid size-8 place-items-center rounded-xl transition-colors",
              i === menu ? "bg-brand-500/15 text-brand-600" : "text-ink-muted",
            )}
          >
            <Ic className="size-4" />
          </span>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="divisa flex h-11 shrink-0 items-center justify-between border-b px-5">
          <p className="font-mono text-[10px] tracking-wide text-ink-muted">{trilha}</p>
          <span className="flex h-7 w-44 items-center gap-2 rounded-full border border-line/70 px-3 text-[10px] text-ink-muted">
            <IconeBusca className="size-3" /> Buscar…
          </span>
        </div>
        <div className="relative min-h-0 flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- 01 · Captura ---------------- */

export function TelaCaptura({ ativo }: { ativo: boolean }) {
  const rnd = sorteio(21);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const pontos = Array.from({ length: 70 }, (_, i) => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 150;
    return { x: r2(170 + Math.cos(a) * r), y: r2(170 + Math.sin(a) * r), i };
  });

  return (
    <Moldura ativo={ativo} menu={1} trilha="leedfly / capturas / clínicas odontológicas">
      <div className="flex h-full gap-5">
        <div className="relative w-[340px] shrink-0">
          <svg viewBox="0 0 340 340" className="size-full" aria-hidden>
            <defs>
              <linearGradient id="tela-feixe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0" />
                <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <circle cx="170" cy="170" r="160" fill="color-mix(in oklch, var(--color-brand-500) 6%, transparent)" stroke="var(--color-brand-500)" strokeOpacity="0.4" />
            {[55, 110].map((r) => (
              <circle key={r} cx="170" cy="170" r={r} fill="none" stroke="var(--color-ink)" strokeOpacity="0.1" strokeDasharray="2 5" />
            ))}
            <g className="radar-varredura" style={{ transformOrigin: "170px 170px" }}>
              <path d="M170 170 L330 170 A160 160 0 0 0 283.1 56.9 Z" fill="url(#tela-feixe)" />
            </g>
            {pontos.map((p) =>
              p.i % 3 === 0 ? (
                <circle
                  key={p.i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="var(--color-brand-500)"
                  className="tela-ponto"
                  style={{ "--i": p.i / 3, transformOrigin: `${p.x}px ${p.y}px` } as CSSProperties}
                />
              ) : (
                <circle key={p.i} cx={p.x} cy={p.y} r="1.1" fill="var(--color-ink)" opacity="0.3" />
              ),
            )}
            <circle cx="170" cy="170" r="4" fill="var(--color-ink)" />
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[10px]">
              <IconeMapa className="size-3 text-brand-500" /> Curitiba/PR · 10 km
            </span>
            <span className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[10px]">
              <IconeFiltro className="size-3 text-brand-500" /> CNPJ ativo
            </span>
          </div>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-brand-500 tabular-nums">
              <Contador valor={ativo ? 38 : 0} duracao={1800} />
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-ink-muted uppercase">empresas encontradas</span>
          </p>
          <div className="mt-4 space-y-1.5">
            {LEADS_DEMO.slice(0, 4).map((l, i) => (
              <Cascata key={l.nome} i={i} className="flex items-center gap-2.5 rounded-xl border border-line/60 bg-surface-muted/50 px-3 py-2">
                <Avatar nome={l.nome} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">{l.nome}</p>
                  <p className="text-[10px] text-ink-muted">{l.bairro} · {(1.2 + i * 1.7).toFixed(1).replace(".", ",")} km</p>
                </div>
                <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[9px] font-semibold text-ok">nova</span>
              </Cascata>
            ))}
          </div>
        </div>
      </div>
    </Moldura>
  );
}

/* ---------------- 02 · Organize ---------------- */

export function TelaFunil({ ativo }: { ativo: boolean }) {
  return (
    <Moldura ativo={ativo} menu={2} trilha="leedfly / leads / funil">
      <div className="flex h-full gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold">Funil de vendas</p>
            <div className="flex gap-1.5 text-[10px]">
              {["Todos", "Score 80+", "Com WhatsApp"].map((f, i) => (
                <span key={f} className={cx("rounded-full px-2.5 py-1", i === 1 ? "bg-brand-600 text-white" : "border border-line text-ink-muted")}>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {LEADS_DEMO.map((l, i) => (
              <Cascata
                key={l.nome}
                i={i}
                className={cx(
                  "flex items-center gap-2.5 rounded-xl px-3 py-[7px]",
                  i === 0 ? "bg-brand-500/10 ring-1 ring-brand-500/30" : "border border-line/50",
                )}
              >
                <Avatar nome={l.nome} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">{l.nome}</p>
                  <p className="text-[10px] text-ink-muted">{l.segmento} · {l.bairro}</p>
                </div>
                <IconeWhatsapp className="size-3.5 text-ok" />
                <AnelScore valor={l.score} tamanho={28} ativo={ativo} atraso={i * 120} />
              </Cascata>
            ))}
          </div>
        </div>

        <Cascata i={4} className="w-[230px] shrink-0 rounded-2xl border border-line/70 bg-surface-muted/60 p-4">
          <p className="font-mono text-[9px] tracking-[0.2em] text-brand-500 uppercase">Por que 92?</p>
          <div className="mt-3 flex justify-center">
            <AnelScore valor={92} tamanho={92} espessura={6} ativo={ativo}>
              <span className="text-2xl font-bold">92</span>
            </AnelScore>
          </div>
          <ul className="mt-4 space-y-2.5 text-[11px]">
            {[
              { r: "Segmento", v: 96 },
              { r: "Porte", v: 88 },
              { r: "Distância", v: 91 },
            ].map((m, i) => (
              <li key={m.r}>
                <div className="flex justify-between text-ink-muted">
                  <span>{m.r}</span>
                  <span className="tabular-nums">{m.v}</span>
                </div>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full origin-left rounded-full bg-ok transition-transform duration-1000 ease-fluida"
                    style={{ transform: `scaleX(${ativo ? m.v / 100 : 0})`, transitionDelay: `${600 + i * 150}ms` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </Cascata>
      </div>
    </Moldura>
  );
}

/* ---------------- 03 · Converse ---------------- */

export function TelaConversa({ ativo }: { ativo: boolean }) {
  return (
    <Moldura ativo={ativo} menu={2} trilha="leedfly / leads / odonto-sorriso-batel">
      <div className="flex h-full gap-4">
        <Cascata i={0} className="w-[220px] shrink-0 rounded-2xl border border-line/70 bg-surface-muted/60 p-4">
          <Avatar nome="Odonto Sorriso Batel" className="size-12 rounded-2xl text-sm" />
          <p className="mt-3 text-sm font-bold">Odonto Sorriso Batel</p>
          <p className="text-[11px] text-ink-muted">Clínica odontológica · Batel</p>
          <p className="mt-3 font-mono text-[10px] text-ink-muted">CNPJ 34.•••.•••/0001-72</p>
          <div className="mt-4 space-y-2 text-[11px]">
            <p className="flex items-center gap-2"><IconeWhatsapp className="size-3.5 text-ok" /> (41) 9••••-8127</p>
            <p className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-ok" /> WhatsApp verificado</p>
            <p className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-brand-500" /> Score 92</p>
          </div>
        </Cascata>

        <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line/70">
          <div className="divisa flex items-center gap-2.5 border-b px-4 py-3">
            <span className="grid size-8 place-items-center rounded-full bg-ok-soft text-ok">
              <IconeWhatsapp className="size-4" />
            </span>
            <div>
              <p className="text-[12px] font-bold">Dra. Marina</p>
              <p className="text-[10px] text-ok">online</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-2.5 p-4 text-[12px]">
            <Balao i={1} eu>Olá, Marina! Ajudamos clínicas a lotar a agenda. Podemos conversar?</Balao>
            <Balao i={2}>Oi! Pode ser, como funciona?</Balao>
            <Balao i={3} eu>Te mostro em 15 min. Quinta às 15h?</Balao>
            <Balao i={4}>Fechado, quinta às 15h 👍</Balao>
          </div>
        </div>
      </div>
    </Moldura>
  );
}

function Balao({ i, eu, children }: { i: number; eu?: boolean; children: ReactNode }) {
  return (
    <Cascata
      i={i}
      className={cx(
        "max-w-[78%] rounded-2xl px-3.5 py-2 leading-snug",
        eu ? "self-end rounded-br-md bg-brand-600 text-white" : "self-start rounded-bl-md bg-surface-muted",
      )}
    >
      {children}
    </Cascata>
  );
}

/* ---------------- 04 · Feche ---------------- */

const ETAPAS = ["Novo", "Conversa", "Reunião", "Proposta", "Fechado"];
const SERIE = [14, 22, 18, 30, 27, 38, 35, 47, 44, 58, 55, 68, 76, 72, 86, 96];

export function TelaNegocio({ ativo }: { ativo: boolean }) {
  const pts = SERIE.map((v, i) => [(i / (SERIE.length - 1)) * 300, 100 - v] as const);
  const linha = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y}`).join(" ");

  return (
    <Moldura ativo={ativo} menu={0} trilha="leedfly / negócios / odonto-sorriso-batel">
      <div className="grid h-full grid-cols-[1fr_1fr] gap-4">
        <Cascata i={0} className="flex flex-col rounded-2xl border border-ok/40 bg-ok-soft/40 p-5">
          <p className="flex items-center gap-2 text-sm font-bold">
            <span className="grid size-6 place-items-center rounded-full bg-ok text-[11px] text-surface">✓</span>
            Contrato fechado
          </p>
          <p className="mt-4 text-5xl font-bold tracking-tight text-ok tabular-nums">
            <Contador valor={ativo ? 4800 : 0} duracao={1600} formatar={(n) => fmt.moeda(n)} />
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">Odonto Sorriso Batel · plano anual</p>

          <div className="relative mt-auto">
            <div className="absolute top-[6px] right-1 left-1 h-0.5 bg-line" />
            <div
              className="absolute top-[6px] right-1 left-1 h-0.5 origin-left bg-ok transition-transform duration-[1400ms] ease-fluida"
              style={{ transform: `scaleX(${ativo ? 1 : 0})`, transitionDelay: "300ms" }}
            />
            <div className="relative flex justify-between">
              {ETAPAS.map((e, i) => (
                <div key={e} className="flex flex-col items-center gap-1.5">
                  <span
                    className={cx("size-3.5 rounded-full border-2 transition-all duration-300", ativo ? "border-ok bg-ok" : "border-line bg-surface")}
                    style={{ transitionDelay: ativo ? `${300 + i * 280}ms` : "0ms" }}
                  />
                  <span className="text-[9px] text-ink-muted">{e}</span>
                </div>
              ))}
            </div>
          </div>
        </Cascata>

        <div className="flex flex-col gap-4">
          <Cascata i={1} className="rounded-2xl border border-line/70 p-4">
            <p className="font-mono text-[9px] tracking-[0.2em] text-ink-muted uppercase">Este mês</p>
            <p className="mt-1 text-3xl font-bold text-brand-500 tabular-nums">
              +<Contador valor={ativo ? 1214 : 0} duracao={1800} formatar={fmt.numero} />
            </p>
            <p className="text-[11px] text-ink-muted">empresas qualificadas pela IA</p>
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="mt-2 h-20 w-full overflow-visible">
              <path
                d={linha}
                pathLength={1}
                fill="none"
                stroke="var(--color-brand-500)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="tela-linha"
              />
            </svg>
          </Cascata>
          <Cascata i={2} className="grid flex-1 grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line/70 p-4">
              <p className="font-mono text-[9px] tracking-[0.2em] text-ink-muted uppercase">Propostas</p>
              <p className="mt-2 text-xl font-bold">R$ 352 mil</p>
            </div>
            <div className="rounded-2xl border border-line/70 p-4">
              <p className="font-mono text-[9px] tracking-[0.2em] text-ink-muted uppercase">Conversão</p>
              <p className="mt-2 text-xl font-bold text-ok">18,4%</p>
            </div>
          </Cascata>
        </div>
      </div>
    </Moldura>
  );
}
