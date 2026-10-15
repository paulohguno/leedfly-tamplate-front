"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconeCalendario,
  IconeEnviar,
  IconePainel,
  IconeUpload,
  IconeWhatsapp,
} from "@/components/layout/icones";
import { cx } from "@/lib/format";
import { useMovimentoReduzido } from "@/lib/movimento";
import { useNaTela } from "../movimento";

/*
 * Funcionalidades do app em miniatura para o bento "Na prática".
 *
 * Fiéis ao produto — a importação de CNPJs em
 * CSV/TXT, o envio por modelo aprovado do WhatsApp, a agenda de próximas
 * ações, o relatório do painel em CSV/PDF — e vivas: respondem ao clique.
 *
 * Linguagem visual única para todos: um cabeçalho com o nome da tela, linhas
 * sem contorno sobre um fundo levemente mais claro (`Linha`) e texto em dois
 * tamanhos só. Contorno fica para o que é clicável.
 */

/** Cabeçalho comum: o nome da tela do app de onde o card saiu. */
export function Cabecalho({
  icone,
  titulo,
  extra,
}: {
  icone: ReactNode;
  titulo: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
      <span className="text-brand-500 [&_svg]:size-4">{icone}</span>
      <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{titulo}</p>
      {extra}
    </div>
  );
}

/** Linha de lista: fundo sutil, sem borda. */
export function Linha({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-center gap-3 rounded-xl bg-ink/4 px-3 py-2.5", className)}>
      {children}
    </div>
  );
}

/** Selo pequeno de estado. */
export function Selo({ tom, children }: { tom: "ok" | "marca" | "info" | "perigo" | "neutro"; children: ReactNode }) {
  return (
    <span
      className={cx(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        tom === "ok" && "bg-ok-soft text-ok",
        tom === "marca" && "bg-brand-500/15 text-brand-700",
        tom === "info" && "bg-info-soft text-info",
        tom === "perigo" && "bg-danger-soft text-danger",
        tom === "neutro" && "bg-ink/6 text-ink-muted",
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 02 · Importação de clientes (topo do fluxo de CNPJ)                 */
/* ------------------------------------------------------------------ */

export function ArquivoImportado() {
  return (
    <Cabecalho
      icone={<IconeUpload />}
      titulo={
        <>
          meus-clientes.csv
          <span className="ml-2 font-normal text-ink-muted">312 CNPJs</span>
        </>
      }
      extra={<Selo tom="ok">importado</Selo>}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 04 · WhatsApp                                                       */
/* ------------------------------------------------------------------ */

type Mensagem = { eu: boolean; texto: string; modelo?: string };

/*
 * Modelos aprovados, como no app: a conversa com quem ainda não respondeu
 * começa sempre por um modelo — o WhatsApp não aceita texto livre ali.
 */
const MODELOS = [
  {
    nome: "Agendar reunião",
    envio: "Podemos marcar 15 minutos na quinta às 15h?",
    resposta: "Fechado, quinta às 15h 👍",
  },
  {
    nome: "Enviar proposta",
    envio: "Te enviei a proposta. Qualquer dúvida, me chama por aqui.",
    resposta: "Recebi! Vou olhar ainda hoje.",
  },
];

const INICIO: Mensagem[] = [
  { eu: true, modelo: "Apresentação", texto: "Olá! Ajudamos clínicas a lotar a agenda. Podemos conversar?" },
  { eu: false, texto: "Oi! Pode sim, como funciona?" },
];

export function WhatsappVivo() {
  const raiz = useRef<HTMLDivElement>(null);
  const naTela = useNaTela(raiz, { limiar: 0.35, umaVez: false });
  const reduzido = useMovimentoReduzido();
  const [mensagens, setMensagens] = useState<Mensagem[]>(INICIO);
  const [digitando, setDigitando] = useState(false);
  // Sozinho até a pessoa clicar num modelo; daí em diante ela conduz.
  const [manual, setManual] = useState(false);
  const proximo = useRef(0);
  const tempo = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (tempo.current) window.clearTimeout(tempo.current);
    },
    [],
  );

  const enviar = useCallback(
    (i: number) => {
      if (digitando) return;
      const m = MODELOS[i];
      setMensagens((atual) => [...atual, { eu: true, modelo: m.nome, texto: m.envio }].slice(-3));
      setDigitando(true);
      tempo.current = window.setTimeout(() => {
        setDigitando(false);
        setMensagens((atual) => [...atual, { eu: false, texto: m.resposta }].slice(-3));
      }, 1100);
    },
    [digitando],
  );

  useEffect(() => {
    if (!naTela || reduzido || manual || digitando) return;
    const id = window.setTimeout(() => {
      enviar(proximo.current);
      proximo.current = (proximo.current + 1) % MODELOS.length;
    }, 2400);
    return () => window.clearTimeout(id);
  }, [naTela, reduzido, manual, digitando, enviar]);

  return (
    <div ref={raiz} className="flex h-full flex-col">
      <Cabecalho
        icone={<IconeWhatsapp />}
        titulo={
          <span className="flex items-center gap-2">
            <Image
              src="/profiles/perfil_03.png"
              alt=""
              width={20}
              height={20}
              className="size-5 rounded-full object-cover"
            />
            Dra. Marina
          </span>
        }
        extra={<span className="text-[11px] text-ok">online</span>}
      />

      <div className="flex min-h-56 flex-1 flex-col justify-end gap-2 px-4 pb-3">
        {mensagens.map((m, i) => (
          <div
            key={`${i}-${m.texto}`}
            className={cx(
              "animate-surgir max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-snug",
              m.eu
                ? "self-end rounded-br-md bg-brand-600 text-white"
                : "self-start rounded-bl-md bg-ink/6 text-ink",
            )}
          >
            {m.modelo && <p className="mb-0.5 text-[10px] text-white/65">Modelo · {m.modelo}</p>}
            {m.texto}
          </div>
        ))}
        {digitando && (
          <span className="animate-surgir flex gap-1 self-start rounded-2xl rounded-bl-md bg-ink/6 px-3 py-2.5">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="animate-batida size-1.5 rounded-full bg-ink-muted"
                style={{ animationDelay: `${d * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </div>

      <div className="grid gap-1.5 p-3 pt-0">
        {MODELOS.map((m, i) => (
          <button
            key={m.nome}
            type="button"
            onClick={() => {
              setManual(true);
              enviar(i);
            }}
            disabled={digitando}
            className="flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold text-ink ring-1 ring-line transition-all hover:bg-brand-500/10 hover:ring-brand-500/50 disabled:opacity-50"
          >
            <IconeEnviar className="size-3.5 text-brand-500" />
            {m.nome}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 05 · Agenda                                                         */
/* ------------------------------------------------------------------ */

type Acao = { lead: string; hora?: string; reuniao?: boolean };

/*
 * Como na agenda real: cada lead tem uma "próxima ação" num dia; quando a
 * situação é Reunião, ela ganha horário. Atrasados ficam marcados à parte.
 */
const DIAS: { dia: string; data: number; acoes: Acao[] }[] = [
  { dia: "Seg", data: 13, acoes: [{ lead: "Clínica Dental Ahú" }] },
  {
    dia: "Ter",
    data: 14,
    acoes: [{ lead: "Sorrir Mais Juvevê", hora: "10:00", reuniao: true }, { lead: "OralPrime Água Verde" }],
  },
  { dia: "Qua", data: 15, acoes: [] },
  {
    dia: "Qui",
    data: 16,
    acoes: [{ lead: "Odonto Sorriso Batel", hora: "15:00", reuniao: true }, { lead: "Instituto Bucal Cabral" }],
  },
  { dia: "Sex", data: 17, acoes: [{ lead: "Odonto Vida Portão" }] },
];

// Dias com ação, na ordem em que a agenda passa sozinha por eles.
const DIAS_COM_ACAO = DIAS.flatMap((d, i) => (d.acoes.length ? [i] : []));

export function AgendaSemana() {
  const raiz = useRef<HTMLDivElement>(null);
  const naTela = useNaTela(raiz, { limiar: 0.35, umaVez: false });
  const reduzido = useMovimentoReduzido();
  const [dia, setDia] = useState(3);
  // Passeia pela semana até a pessoa escolher um dia.
  const [manual, setManual] = useState(false);
  const atual = DIAS[dia];

  useEffect(() => {
    if (!naTela || reduzido || manual) return;
    const id = window.setTimeout(() => {
      const k = DIAS_COM_ACAO.indexOf(dia);
      setDia(DIAS_COM_ACAO[(k + 1) % DIAS_COM_ACAO.length]);
    }, 2200);
    return () => window.clearTimeout(id);
  }, [naTela, reduzido, manual, dia]);

  return (
    <div ref={raiz} className="flex h-full flex-col">
      <Cabecalho icone={<IconeCalendario />} titulo="Agenda" extra={<Selo tom="perigo">2 atrasados</Selo>} />
      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="grid grid-cols-5 gap-1">
          {DIAS.map((d, i) => (
            <button
              key={d.dia}
              type="button"
              onClick={() => {
                setManual(true);
                setDia(i);
              }}
              className={cx(
                "flex flex-col items-center gap-0.5 rounded-xl py-2 transition-all duration-300 ease-fluida",
                i === dia ? "bg-brand-600 text-white shadow-sm" : "text-ink-muted hover:bg-ink/4 hover:text-ink",
              )}
            >
              <span className="text-[10px] uppercase">{d.dia}</span>
              <span className="text-base font-bold tabular-nums">{d.data}</span>
              <span className="flex h-1 gap-0.5">
                {d.acoes.map((a, k) => (
                  <span
                    key={k}
                    className={cx(
                      "size-1 rounded-full",
                      i === dia ? "bg-white/80" : a.reuniao ? "bg-brand-500" : "bg-info",
                    )}
                  />
                ))}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex min-h-28 flex-1 flex-col gap-1.5">
          {atual.acoes.length === 0 ? (
            <p className="m-auto text-xs text-ink-muted">Nenhuma ação neste dia.</p>
          ) : (
            atual.acoes.map((a) => (
              <div key={`${atual.dia}-${a.lead}`} className="animate-surgir">
                <Linha>
                  <span
                    className={cx(
                      "w-10 shrink-0 font-mono text-[11px] font-semibold",
                      a.hora ? "text-brand-500" : "text-ink-muted",
                    )}
                  >
                    {a.hora ?? "dia"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-ink">{a.lead}</span>
                  <Selo tom={a.reuniao ? "marca" : "info"}>{a.reuniao ? "Reunião" : "Retorno"}</Selo>
                </Linha>
              </div>
            ))
          )}
        </div>

        {/* Resumo da semana: dá chão ao card e conta o todo. */}
        <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-3 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand-500" /> 2 reuniões
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-info" /> 4 retornos
          </span>
          <span className="tabular-nums">6 ações na semana</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 06 · Relatório do painel                                            */
/* ------------------------------------------------------------------ */

const INDICADORES = [
  { rotulo: "Leads capturados", valor: "1.214" },
  { rotulo: "Leads ativos", valor: "932" },
  { rotulo: "Score médio", valor: "87" },
  { rotulo: "Conversão", valor: "11%" },
];

function baixar(conteudo: Blob, nome: string) {
  const url = URL.createObjectURL(conteudo);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportarRelatorio() {
  const [feito, setFeito] = useState<"csv" | "pdf" | null>(null);

  // O mesmo conteúdo que o app exporta do painel: os indicadores do período.
  function csv() {
    const linhas = ["Indicador;Valor", ...INDICADORES.map((i) => `${i.rotulo};${i.valor}`)];
    baixar(
      new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8;" }),
      "leedfly-relatorio-exemplo.csv",
    );
    setFeito("csv");
  }

  async function pdf() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFontSize(18);
    doc.text("Relatório do painel · exemplo Leedfly", 14, 20);
    autoTable(doc, {
      startY: 28,
      head: [["Indicador", "Valor"]],
      body: INDICADORES.map((i) => [i.rotulo, i.valor]),
    });
    doc.save("leedfly-relatorio-exemplo.pdf");
    setFeito("pdf");
  }

  return (
    <div className="flex h-full flex-col">
      <Cabecalho
        icone={<IconePainel />}
        titulo="Relatório do painel"
        extra={<span className="text-[11px] text-ink-muted">30 dias</span>}
      />
      <div className="grid flex-1 grid-cols-2 gap-1.5 px-4">
        {INDICADORES.map((i) => (
          <div key={i.rotulo} className="flex flex-col justify-between rounded-xl bg-ink/4 p-3">
            <p className="text-[11px] text-ink-muted">{i.rotulo}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-ink tabular-nums">{i.valor}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-4">
        {(["csv", "pdf"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={f === "csv" ? csv : pdf}
            className={cx(
              "rounded-full py-2 text-xs font-semibold transition-all duration-300",
              feito === f
                ? "bg-ok text-surface"
                : f === "csv"
                  ? "bg-brand-600 text-white hover:bg-brand-500"
                  : "text-ink ring-1 ring-line hover:ring-brand-500/50",
            )}
          >
            {feito === f ? "✓ Baixado" : `Exportar ${f.toUpperCase()}`}
          </button>
        ))}
      </div>
    </div>
  );
}
