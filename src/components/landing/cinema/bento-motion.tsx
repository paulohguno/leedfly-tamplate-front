"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import { Contador } from "@/components/motion/contador";
import {
  IconeCalendario,
  IconeCapturas,
  IconeEmpresa,
  IconeFaisca,
  IconeGlobo,
  IconeLeads,
  IconeMapa,
  IconePainel,
  IconeTelefone,
  IconeVisitantes,
} from "@/components/layout/icones";
import { cx, fmt } from "@/lib/format";
import { useMovimentoReduzido } from "@/lib/movimento";
import { useNaTela } from "../movimento";
import { AnelScore, Avatar, LEADS_DEMO } from "../pecas";
import { Cabecalho, Linha } from "./bento-funcionalidades";

/*
 * Cards do bento que se apresentam sozinhos: tocam um roteiro curto em loop
 * enquanto estão na tela, para quem só rola a página entender o benefício sem
 * clicar em nada. Tudo o que aparece existe no app — os campos da nova
 * captura, os dados do Google e da Receita que a pessoa escolhe trazer, o
 * score da IA com a justificativa. Com `prefers-reduced-motion`, cada card
 * mostra direto o último quadro do roteiro.
 */

/**
 * Avança `passo` pelas durações dadas e recomeça do zero, contando `volta`.
 * Pausa fora da tela. `duracoes` precisa ser estável (constante de módulo).
 */
function useRoteiro(ref: RefObject<HTMLElement | null>, duracoes: readonly number[]) {
  const naTela = useNaTela(ref, { limiar: 0.35, umaVez: false });
  const reduzido = useMovimentoReduzido();
  const [estado, setEstado] = useState({ passo: 0, volta: 0 });

  useEffect(() => {
    if (!naTela || reduzido) return;
    const id = window.setTimeout(() => {
      setEstado((e) =>
        e.passo + 1 >= duracoes.length ? { passo: 0, volta: e.volta + 1 } : { ...e, passo: e.passo + 1 },
      );
    }, duracoes[estado.passo]);
    return () => window.clearTimeout(id);
  }, [naTela, reduzido, estado, duracoes]);

  return reduzido ? { passo: duracoes.length - 1, volta: 0, reduzido } : { ...estado, reduzido };
}

/** Texto que se digita sozinho. Remonte com `key` para digitar de novo. */
function Digitado({ texto, ms = 32, cursor = true }: { texto: string; ms?: number; cursor?: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setN((v) => (v >= texto.length ? v : v + 1)), ms);
    return () => window.clearInterval(id);
  }, [texto, ms]);

  return (
    <>
      {texto.slice(0, n)}
      {cursor && n < texto.length && (
        <span className="caret ml-px inline-block h-3.5 w-px translate-y-0.5 bg-brand-500" />
      )}
    </>
  );
}

/**
 * Clique dos mini vídeos: `atraso` ms depois, o botão `[data-alvo]` dentro de
 * `raiz` afunda e solta uma onda (`.botao-mini` no CSS). Mudar `chave` repete
 * o clique no mesmo botão; `alvo` nulo não clica nada.
 */
function useCliqueDemo(
  raiz: RefObject<HTMLElement | null>,
  alvo: string | null,
  chave: string,
  atraso = 750,
) {
  useEffect(() => {
    const el = alvo ? raiz.current?.querySelector<HTMLElement>(`[data-alvo="${alvo}"]`) : null;
    if (!el) return;
    let soltar = 0;
    const id = window.setTimeout(() => {
      el.dataset.pressionado = "true";
      soltar = window.setTimeout(() => delete el.dataset.pressionado, 650);
    }, atraso);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(soltar);
      delete el.dataset.pressionado;
    };
  }, [raiz, alvo, chave, atraso]);
}

/* ------------------------------------------------------------------ */
/* Leads sob medida: a captura inteira, do pedido ao resultado          */
/* ------------------------------------------------------------------ */

const OBJETIVO = "Clínicas odontológicas com foco em implantes";
const LOCAL = "Curitiba - PR";
const QUANTIDADE = { inicial: 10, pedida: 25 };

/*
 * Só o preenchimento dos dados da captura, como na tela do app: o pedido é
 * digitado, o local e a quantidade são escolhidos e "Iniciar captura" é
 * clicado. Depois de uma pausa, os valores esmaecem e tudo recomeça.
 */
const ROTEIRO_CAPTURA = [2200, 1400, 1400, 1300, 1800, 900] as const;
const F = { digitar: 0, local: 1, quantidade: 2, clique: 3, pausa: 4, saida: 5 };

export function CapturaAutomatica() {
  const raiz = useRef<HTMLDivElement>(null);
  const { passo, volta, reduzido } = useRoteiro(raiz, ROTEIRO_CAPTURA);
  // Sem movimento, fica no formulário preenchido.
  const fase = reduzido ? F.pausa : passo;
  const saindo = fase === F.saida;
  const esmaecer = cx(
    "transition-[opacity,transform,filter] duration-700 ease-fluida",
    saindo && "-translate-y-1 opacity-0 blur-[2px]",
  );

  // Que botão é clicado em cada etapa (e quanto espera para clicar).
  const clique: { alvo: string | null; atraso?: number } = reduzido
    ? { alvo: null }
    : fase === F.quantidade
      ? { alvo: "mais", atraso: 450 }
      : fase === F.clique
        ? { alvo: "iniciar", atraso: 750 }
        : { alvo: null };
  useCliqueDemo(raiz, clique.alvo, `${volta}-${fase}`, clique.atraso);

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <Cabecalho icone={<IconeCapturas />} titulo="Nova captura" />

      <div className="flex flex-1 flex-col gap-5 px-4 pt-2 pb-4">
        <div>
          <p className="text-[11px] text-ink-muted">O que você procura?</p>
          <p
            className={cx(
              "mt-1.5 flex h-11 items-center overflow-hidden rounded-xl px-4 text-xs whitespace-nowrap text-ink transition-[background-color,box-shadow] duration-500 ease-fluida sm:text-sm",
              fase === F.digitar && !reduzido ? "bg-brand-500/10 ring-1 ring-brand-500/40" : "bg-ink/4",
            )}
          >
            <span className={cx("block truncate", esmaecer)}>
              {fase > F.digitar ? OBJETIVO : <Digitado key={volta} texto={OBJETIVO} />}
            </span>
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_15rem]">
          <div>
            <p className="text-[11px] text-ink-muted">Onde</p>
            <p
              className={cx(
                "mt-1.5 flex h-11 items-center gap-2 overflow-hidden rounded-xl px-4 text-sm whitespace-nowrap text-ink transition-[background-color,box-shadow] duration-500 ease-fluida",
                fase === F.local && !reduzido ? "bg-brand-500/10 ring-1 ring-brand-500/40" : "bg-ink/4",
              )}
            >
              <IconeMapa className="size-4 shrink-0 text-brand-500" />
              <span className={cx("block truncate", esmaecer)}>
                {fase > F.local ? (
                  LOCAL
                ) : fase === F.local ? (
                  <Digitado key={volta} texto={LOCAL} ms={45} />
                ) : null}
              </span>
            </p>
          </div>

          <div>
            <p className="text-[11px] text-ink-muted">Quantidade</p>
            {/* O mesmo seletor numérico da tela real: menos, número, mais. */}
            <div className="mt-1.5 flex h-11 items-center justify-between rounded-xl bg-ink/4 p-1">
              <span className="grid size-9 place-items-center rounded-lg text-lg text-ink-muted">−</span>
              <span className="flex min-w-24 items-baseline justify-center gap-1 px-2">
                <span className="text-xl font-bold tracking-tight text-ink tabular-nums">
                  <Contador
                    valor={fase >= F.quantidade && !saindo ? QUANTIDADE.pedida : QUANTIDADE.inicial}
                    duracao={1100}
                  />
                </span>
                <span className="text-xs text-ink-muted">leads</span>
              </span>
              <span
                data-alvo="mais"
                className={cx(
                  "botao-mini grid size-9 place-items-center rounded-lg text-lg transition-colors duration-300",
                  fase === F.quantidade ? "bg-brand-500/20 text-brand-500" : "text-ink-muted",
                )}
              >
                +
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-end border-t border-line/50 pt-4">
          <span
            data-alvo="iniciar"
            className="botao-mini rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_var(--color-brand-500)]"
          >
            Iniciar captura →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lead completo: a ficha se preenche com os dados escolhidos           */
/* ------------------------------------------------------------------ */

// Dados que a etapa "Perfil do lead" traz do Google (Maps) e da Receita (CNPJ).
const DADOS: { icone: ReactNode; rotulo: string; valor: string }[] = [
  { icone: <IconeTelefone />, rotulo: "Telefone", valor: "(41) 3352-0187" },
  { icone: <IconeGlobo />, rotulo: "Site", valor: "odontosorrisobatel.com.br" },
  { icone: <IconeMapa />, rotulo: "Endereço", valor: "Batel · Curitiba - PR" },
  { icone: <IconeCalendario />, rotulo: "Horários", valor: "Seg a sex · 8h às 19h" },
  { icone: <IconeEmpresa />, rotulo: "CNAE", valor: "8630-5/04 · Odontologia" },
];

const ROTEIRO_FICHA = [...DADOS.map(() => 550), 3200] as const;

export function FichaCompleta() {
  const raiz = useRef<HTMLDivElement>(null);
  const { passo, volta } = useRoteiro(raiz, ROTEIRO_FICHA);
  const visiveis = Math.min(passo + 1, DADOS.length);
  const lead = LEADS_DEMO[0];

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Avatar nome={lead.nome} className="size-9 text-xs" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{lead.nome}</p>
          <p className="truncate text-[11px] text-ink-muted">
            {lead.segmento} · {lead.bairro}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4">
        {DADOS.map((d, i) =>
          i < visiveis ? (
            <div key={`${volta}-${d.rotulo}`} className="animate-surgir">
              <Linha className="py-2">
                <span className="text-brand-500 [&_svg]:size-3.5">{d.icone}</span>
                <span className="w-16 shrink-0 text-[11px] text-ink-muted">{d.rotulo}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-ink">{d.valor}</span>
              </Linha>
            </div>
          ) : (
            <div
              key={`${volta}-${d.rotulo}`}
              className="h-9 rounded-xl border border-dashed border-line/60"
            />
          ),
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nota explicada: o score da IA e o porquê dele                        */
/* ------------------------------------------------------------------ */

const AVALIADOS = [
  {
    nome: "Odonto Sorriso Batel",
    score: 92,
  },
  {
    nome: "OralPrime Água Verde",
    score: 81,
  },
  {
    nome: "Odonto Popular Centro",
    score: 58,
  },
];

// Por lead: um instante com o anel vazio, depois a nota.
const ROTEIRO_NOTA = AVALIADOS.flatMap(() => [500, 4300]);

export function NotaExplicada() {
  const raiz = useRef<HTMLDivElement>(null);
  const { passo, volta } = useRoteiro(raiz, ROTEIRO_NOTA);
  const atual = Math.floor(passo / 2);
  const cheio = passo % 2 === 1;
  const lead = AVALIADOS[atual];

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <Cabecalho icone={<IconeFaisca />} titulo="Score dos leads" />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-2 text-center">
        <AnelScore
          key={`${volta}-${atual}`}
          valor={lead.score}
          tamanho={104}
          espessura={6}
          ativo={cheio}
          className="[&>span]:text-3xl [&>span]:font-bold"
        >
          <Contador key={`${volta}-${atual}`} valor={cheio ? lead.score : 0} duracao={1300} />
        </AnelScore>
        <p className="text-sm font-semibold text-ink">{lead.nome}</p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-4 pt-2">
        {AVALIADOS.map((l, i) => (
          <span
            key={l.nome}
            className={cx(
              "h-1 rounded-full transition-colors duration-500",
              i === atual ? "bg-brand-500" : "bg-ink/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Perfil empresarial: o ponto de partida da IA                          */
/* ------------------------------------------------------------------ */

// Os campos da tela "Perfil empresarial" que mais pesam na nota da IA.
const PERFIL = [
  { rotulo: "Nome da empresa", valor: "Sul Implantes" },
  { rotulo: "Ticket médio (R$)", valor: "2.500" },
  { rotulo: "Descrição do negócio", valor: "Distribuidora de materiais odontológicos" },
  { rotulo: "Público-alvo", valor: "Clínicas odontológicas" },
];

// Um passo por campo digitado, uma pausa com tudo preenchido e uma saída
// suave (os valores esmaecem e a barra volta) antes de recomeçar.
const ROTEIRO_PERFIL = [...PERFIL.map((c) => 500 + c.valor.length * 28), 3600, 900] as const;
const COMPLETO = PERFIL.length;
const SAINDO = PERFIL.length + 1;

export function PerfilAutomatico() {
  const raiz = useRef<HTMLDivElement>(null);
  const { passo, volta, reduzido } = useRoteiro(raiz, ROTEIRO_PERFIL);
  // Sem movimento, fica no quadro completo em vez do de saída.
  const fase = reduzido ? COMPLETO : passo;
  const saindo = fase === SAINDO;
  const preenchidos = saindo ? 0 : Math.min(fase, PERFIL.length);
  const percentual = Math.round((preenchidos / PERFIL.length) * 100);

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <Cabecalho
        icone={<IconeEmpresa />}
        titulo="Perfil empresarial"
        extra={
          <span className="flex items-center gap-2 text-[11px] text-ink-muted tabular-nums">
            <span className="block h-1 w-20 overflow-hidden rounded-full bg-ink/10">
              <span
                className="block h-full origin-left rounded-full bg-linear-to-r from-brand-600 to-brand-400 transition-transform duration-700 ease-fluida"
                style={{ transform: `scaleX(${preenchidos / PERFIL.length})` }}
              />
            </span>
            <span className="w-8 text-right">
              <Contador valor={percentual} duracao={600} />%
            </span>
          </span>
        }
      />

      <div className="grid flex-1 content-start gap-5 px-4 pt-2 pb-4 sm:grid-cols-2">
        {PERFIL.map((c, i) => {
          const digitando = fase === i;
          const cheio = i < fase && fase <= SAINDO;
          return (
            <div key={c.rotulo} className={cx(i >= 2 && "sm:col-span-2")}>
              <p className="text-[11px] text-ink-muted">{c.rotulo}</p>
              {/* Altura fixa e uma linha só: digitar ou esvaziar não mexe no tamanho do card. */}
              <p
                className={cx(
                  "mt-1.5 flex h-11 items-center overflow-hidden rounded-xl px-4 text-sm whitespace-nowrap transition-[background-color,box-shadow] duration-500 ease-fluida",
                  digitando && !reduzido
                    ? "bg-brand-500/10 text-ink ring-1 ring-brand-500/40"
                    : "bg-ink/4 text-ink",
                )}
              >
                <span
                  className={cx(
                    "block truncate transition-[opacity,transform,filter] duration-700 ease-fluida",
                    saindo && "-translate-y-1 opacity-0 blur-[2px]",
                  )}
                >
                  {cheio ? c.valor : digitando ? <Digitado key={volta} texto={c.valor} ms={28} /> : null}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Painel: os números da operação                                      */
/* ------------------------------------------------------------------ */

const KPIS = [
  { rotulo: "Leads capturados", valor: 1214, sufixo: "" },
  { rotulo: "Leads ativos", valor: 932, sufixo: "" },
  { rotulo: "Score médio", valor: 87, sufixo: "" },
  { rotulo: "Conversão", valor: 11, sufixo: "%" },
];

// Leads por dia nas últimas duas semanas (altura relativa).
const POR_DIA = [38, 52, 44, 61, 57, 30, 24, 66, 72, 58, 80, 76, 41, 88];
const COTA = { usada: 378, total: 500 };

/**
 * Sem loop: o painel enche uma vez quando aparece (números sobem devagar, em
 * 4,5 s), fica cheio enquanto está na tela e só zera quando sai dela, para
 * animar de novo na próxima vez que for visto.
 */
export function PainelVivo() {
  const raiz = useRef<HTMLDivElement>(null);
  const naTela = useNaTela(raiz, { limiar: 0.35, umaVez: false });
  const reduzido = useMovimentoReduzido();
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    // Um respiro curto antes de encher, para o quadro terminar de entrar.
    const id = window.setTimeout(() => setVisto(naTela), naTela ? 500 : 0);
    return () => window.clearTimeout(id);
  }, [naTela]);

  const cheio = reduzido || visto;
  // Ao sair da tela, zera na hora (escondido); ao entrar, sobe devagar.
  const duracao = cheio ? 4500 : 1;

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <Cabecalho icone={<IconePainel />} titulo="Painel" />

      <div className="grid grid-cols-2 gap-1.5 px-4 sm:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.rotulo} className="rounded-xl bg-ink/4 p-3">
            <p className="text-[11px] text-ink-muted">{k.rotulo}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink tabular-nums">
              <Contador valor={cheio ? k.valor : 0} duracao={duracao} formatar={fmt.numero} />
              {k.sufixo}
            </p>
          </div>
        ))}
      </div>

      <div className="grid flex-1 gap-1.5 p-4 sm:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col rounded-xl bg-ink/4 p-3">
          <p className="text-[11px] text-ink-muted">Leads por dia</p>
          <div className="mt-3 flex min-h-28 flex-1 items-end gap-1">
            {POR_DIA.map((v, i) => (
              <span
                key={i}
                className="flex-1 origin-bottom rounded-t-md bg-linear-to-t from-brand-600 to-brand-400 transition-transform ease-fluida"
                style={{
                  height: `${v}%`,
                  transform: `scaleY(${cheio ? 1 : 0})`,
                  transitionDuration: cheio ? "2800ms" : "400ms",
                  transitionDelay: cheio ? `${i * 120}ms` : "0ms",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-ink/4 p-3">
          <p className="text-[11px] text-ink-muted">Cota do ciclo</p>
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
              <Contador valor={cheio ? COTA.usada : 0} duracao={duracao} />
              <span className="ml-1 text-sm font-normal text-ink-muted">de {COTA.total}</span>
            </p>
            <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-ink/10">
              <span
                className="block h-full origin-left rounded-full bg-linear-to-r from-brand-600 to-brand-400 transition-transform duration-[4500ms] ease-fluida"
                style={{ transform: `scaleX(${cheio ? COTA.usada / COTA.total : 0})` }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Organize: o lead andando no quadro e a agenda da semana             */
/* ------------------------------------------------------------------ */

// As etapas da tela de leads (visão Quadro), na ordem do funil.
const COLUNAS = [
  { nome: "Novo", cor: "bg-brand-500", leads: ["Metalúrgica Iguaçu", "Contábil Mercês"] },
  { nome: "Em conversa", cor: "bg-indigo", leads: ["Clínica Dental Ahú"] },
  { nome: "Reunião", cor: "bg-info", leads: ["OralPrime Água Verde"] },
  { nome: "Convertido", cor: "bg-ok", leads: ["Laboratório Rebouças"] },
];
const VIAJANTE = LEADS_DEMO[0];

// Uma coluna por passo, uma pausa em "Convertido" e a saída suave.
const ROTEIRO_QUADRO = [1300, 1300, 1300, 2600, 700] as const;

export function QuadroAutomatico() {
  const raiz = useRef<HTMLDivElement>(null);
  const { passo, reduzido } = useRoteiro(raiz, ROTEIRO_QUADRO);
  const fase = reduzido ? COLUNAS.length - 1 : passo;
  const saindo = fase === COLUNAS.length;
  const coluna = Math.min(fase, COLUNAS.length - 1);
  const convertido = coluna === COLUNAS.length - 1 && !saindo;

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <Cabecalho icone={<IconeLeads />} titulo="Quadro de leads" />
      {/* No celular o quadro rola para o lado em vez de espremer as quatro colunas. */}
      <div className="flex-1 overflow-x-auto">
        <div className="relative grid h-full min-w-[44rem] grid-cols-4 gap-2 px-4 pb-4">
          {COLUNAS.map((c) => (
            <div key={c.nome} className="flex min-w-0 flex-col gap-2 rounded-xl bg-ink/4 p-2">
              <p className="flex items-center gap-1.5 px-1 pt-0.5 text-[11px] font-semibold text-ink">
                <span className={cx("size-1.5 rounded-full", c.cor)} />
                <span className="truncate">{c.nome}</span>
              </p>
              {/* Vaga do lead que anda */}
              <div className="h-12 rounded-lg border border-dashed border-line/60" />
              {c.leads.map((n) => (
                <div key={n} className="flex h-12 items-center gap-2 rounded-lg bg-surface/60 px-2">
                  <Avatar nome={n} className="size-6 text-[9px]" />
                  <span className="line-clamp-2 min-w-0 flex-1 text-[11px] leading-tight text-ink-muted">
                    {n}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* O lead arrastado de etapa em etapa */}
          <div
            className="absolute top-[2.15rem] left-4 z-10 px-2"
            style={
              {
                width: "calc((100% - 2rem - 3 * 0.5rem) / 4)",
                transform: `translateX(calc(${coluna} * (100% + 0.5rem)))`,
                opacity: saindo ? 0 : 1,
                // Ao recomeçar, volta para "Novo" sem atravessar o quadro.
                transition:
                  fase === 0
                    ? "opacity 0.5s var(--ease-fluida) 0.2s"
                    : "transform 0.8s var(--ease-mola), opacity 0.5s var(--ease-fluida)",
              } as CSSProperties
            }
          >
            <div
              className={cx(
                "flex h-12 items-center gap-1.5 rounded-lg px-2 ring-1 transition-[box-shadow,background-color] duration-500",
                convertido
                  ? "bg-ok/12 shadow-[0_14px_30px_-14px_var(--color-ok)] ring-ok/50"
                  : "bg-brand-500/12 shadow-[0_14px_30px_-14px_var(--color-brand-500)] ring-brand-500/50",
              )}
            >
              <Avatar nome={VIAJANTE.nome} className="size-5 text-[8px]" />
              <span className="line-clamp-2 min-w-0 flex-1 text-[11px] leading-tight font-semibold text-ink">
                {VIAJANTE.nome}
              </span>
              <AnelScore valor={VIAJANTE.score} tamanho={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Próximas ações da semana, como na visão Agenda: reunião tem horário.
const SEMANA: { dia: string; data: number; acoes: { hora?: string; lead: string }[] }[] = [
  { dia: "Seg", data: 13, acoes: [{ lead: "Clínica Dental Ahú" }] },
  {
    dia: "Ter",
    data: 14,
    acoes: [{ hora: "10:00", lead: "Sorrir Mais Juvevê" }, { lead: "OralPrime Água Verde" }],
  },
  { dia: "Qua", data: 15, acoes: [{ lead: "Instituto Bucal Cabral" }] },
  {
    dia: "Qui",
    data: 16,
    acoes: [{ hora: "15:00", lead: "Odonto Sorriso Batel" }, { lead: "Odonto Vida Portão" }],
  },
  { dia: "Sex", data: 17, acoes: [{ hora: "09:30", lead: "Laboratório Rebouças" }] },
];

const ROTEIRO_AGENDA = SEMANA.map(() => 1800);

export function AgendaAutomatica() {
  const raiz = useRef<HTMLDivElement>(null);
  const { passo, volta, reduzido } = useRoteiro(raiz, ROTEIRO_AGENDA);
  const dia = reduzido ? 3 : passo;
  const atual = SEMANA[dia];

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <Cabecalho icone={<IconeCalendario />} titulo="Agenda" />
      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="grid grid-cols-5 gap-1">
          {SEMANA.map((d, i) => (
            <span
              key={d.dia}
              className={cx(
                "flex flex-col items-center gap-0.5 rounded-xl py-2 transition-[background-color,color] duration-500 ease-fluida",
                i === dia ? "bg-brand-600 text-white" : "text-ink-muted",
              )}
            >
              <span className="text-[10px] uppercase">{d.dia}</span>
              <span className="text-base font-bold tabular-nums">{d.data}</span>
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-1 flex-col gap-1.5">
          {atual.acoes.map((a, i) => (
            <div
              key={`${volta}-${atual.dia}-${a.lead}`}
              className="animate-surgir"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Linha className="py-2">
                <span
                  className={cx(
                    "w-10 shrink-0 font-mono text-[11px] font-semibold",
                    a.hora ? "text-brand-500" : "text-ink-muted",
                  )}
                >
                  {a.hora ?? "dia"}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-ink">{a.lead}</span>
              </Linha>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compartilhe: um link pessoal para cada visitante                     */
/* ------------------------------------------------------------------ */

// Como na tela de Visitantes: nome e e-mail, um link por pessoa, ocupando vaga do plano.
const VISITANTES = [
  { nome: "Ana Souza", foto: 1, ativo: true },
  { nome: "Bruno Lima", foto: 2, ativo: true },
  { nome: "Carla Dias", foto: 4, ativo: false },
];
const NOVO = { nome: "Diego Martins", email: "diego@suaempresa.com.br", foto: 3 };
const VAGAS = 5;

// nome → e-mail → enviar o link (vai para o e-mail) → entra na lista → saída suave
const ROTEIRO_VISITANTE = [1300, 1800, 1300, 3000, 900] as const;
const V = { nome: 0, email: 1, enviar: 2, lista: 3, saida: 4 };

export function VisitantesAutomatico() {
  const raiz = useRef<HTMLDivElement>(null);
  const { passo, volta, reduzido } = useRoteiro(raiz, ROTEIRO_VISITANTE);
  const fase = reduzido ? V.lista : passo;
  const saindo = fase === V.saida;
  const enviado = fase >= V.lista && !saindo;
  const naLista = fase >= V.lista && !saindo;
  const esmaecer = cx(
    "transition-[opacity,transform,filter] duration-700 ease-fluida",
    saindo && "-translate-y-1 opacity-0 blur-[2px]",
  );

  useCliqueDemo(raiz, !reduzido && fase === V.enviar ? "enviar" : null, `${volta}-${fase}`, 650);

  const campo = (ativo: boolean) =>
    cx(
      "mt-1.5 flex h-11 items-center overflow-hidden rounded-xl px-4 text-sm whitespace-nowrap text-ink transition-[background-color,box-shadow] duration-500 ease-fluida",
      ativo && !reduzido ? "bg-brand-500/10 ring-1 ring-brand-500/40" : "bg-ink/4",
    );

  return (
    <div ref={raiz} aria-hidden className="flex h-full flex-col">
      <Cabecalho
        icone={<IconeVisitantes />}
        titulo="Visitantes"
        extra={
          <span className="text-[11px] text-ink-muted tabular-nums">
            {VISITANTES.length - 1 + (naLista ? 1 : 0)} de {VAGAS} vagas
          </span>
        }
      />

      <div className="grid flex-1 gap-5 px-4 pt-2 pb-4 sm:grid-cols-2">
        {/* Novo visitante */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[11px] text-ink-muted">Nome</p>
            <p className={campo(fase === V.nome)}>
              <span className={cx("block truncate", esmaecer)}>
                {fase > V.nome ? NOVO.nome : <Digitado key={volta} texto={NOVO.nome} ms={45} />}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[11px] text-ink-muted">E-mail</p>
            <p className={campo(fase === V.email)}>
              <span className={cx("block truncate", esmaecer)}>
                {fase > V.email ? (
                  NOVO.email
                ) : fase === V.email ? (
                  <Digitado key={volta} texto={NOVO.email} ms={38} />
                ) : null}
              </span>
            </p>
          </div>

          <span
            data-alvo="enviar"
            className={cx(
              "botao-mini mt-auto flex h-11 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors duration-500",
              enviado
                ? "bg-ok shadow-[0_10px_30px_-12px_var(--color-ok)]"
                : "bg-brand-600 shadow-[0_10px_30px_-12px_var(--color-brand-500)]",
            )}
          >
            {enviado ? "Link enviado ✓" : "Enviar link"}
          </span>
        </div>

        {/* Quem já tem acesso */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-ink-muted">Com acesso</p>
          {VISITANTES.map((v) => (
            <PessoaVisitante key={v.nome} nome={v.nome} foto={v.foto} ativo={v.ativo} />
          ))}
          <div className="h-11">
            {naLista && (
              <div key={volta} className="animate-surgir">
                <PessoaVisitante nome={NOVO.nome} foto={NOVO.foto} ativo novo />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PessoaVisitante({
  nome,
  foto,
  ativo,
  novo,
}: {
  nome: string;
  foto: number;
  ativo: boolean;
  novo?: boolean;
}) {
  return (
    <Linha className={cx("h-11 px-4 py-0", novo && "bg-brand-500/10 ring-1 ring-brand-500/40")}>
      <Image
        src={`/profiles/perfil_0${foto}.png`}
        alt=""
        width={24}
        height={24}
        className="size-6 rounded-full object-cover"
      />
      <span className="min-w-0 flex-1 truncate text-sm text-ink">{nome}</span>
      <span className={cx("flex items-center gap-1.5 text-[11px]", ativo ? "text-ok" : "text-ink-muted")}>
        <span className={cx("size-1.5 rounded-full", ativo ? "bg-ok" : "bg-ink/25")} />
        {ativo ? "Ativo" : "Expirado"}
      </span>
    </Linha>
  );
}
