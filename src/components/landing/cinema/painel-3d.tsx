import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { BarrasPorDia } from "@/components/charts/barras-por-dia";
import { MiniGrafico } from "@/components/charts/minigrafico";
import { RankingSegmentos } from "@/components/charts/ranking-segmentos";
import { BarraCota } from "@/components/dashboard/cota-ciclo";
import { Kpi } from "@/components/dashboard/kpi";
import { Pilula, Variacao } from "@/components/dashboard/variacao";
import {
  IconeAssinatura,
  IconeBusca,
  IconeCapturas,
  IconeCiclo,
  IconeEmpresa,
  IconeFaisca,
  IconeLeads,
  IconePainel,
  IconeSelo,
  IconeVisitantes,
} from "@/components/layout/icones";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/feedback";
import type { CicloUso } from "@/lib/domain/types";
import { cx } from "@/lib/format";
import { sorteio } from "../movimento";
import { AnelScore, Avatar, LEADS_DEMO } from "../pecas";

/*
 * O dashboard do Leedfly desmontado em camadas.
 *
 * Fiel ao produto: as camadas usam os mesmos componentes da tela real
 * (`Kpi`, `BarrasPorDia`, `RankingSegmentos`), com dados de exemplo — mas
 * enxutas para vitrine. Sai o texto miúdo que na tela de trabalho é útil e
 * aqui só vira ruído (notas dos KPIs, filtros, descrições), e nada fica
 * cortado na dobra: a composição fecha dentro da moldura.
 *
 * Desenhado numa prancheta fixa de 1440×900 — um desktop de verdade, para os
 * componentes caberem no tamanho em que foram feitos — e escalado por fora.
 * Cada camada carrega o próprio "estado explodido" (deslocamento em x/y/z e
 * giro); o hero interpola de lá até zero conforme a rolagem.
 */

export const PRANCHETA = { largura: 1440, altura: 900 } as const;

export interface Explosao {
  x: number;
  y: number;
  z: number;
  rot: number;
}

/* ------------------------------------------------------------------ */
/* dados de exemplo                                                    */
/* ------------------------------------------------------------------ */

const DIA = 86_400_000;
// Ao meio-dia UTC: a data não muda de dia entre o servidor e o navegador.
const hoje = new Date(new Date().toISOString().slice(0, 10) + "T12:00:00Z").getTime();
const isoDia = (deslocamento: number) => new Date(hoje + deslocamento * DIA).toISOString();

const CICLO: CicloUso = {
  id: "demo",
  assinaturaId: "demo",
  empresaId: "demo",
  dataInicio: isoDia(-18),
  dataFim: isoDia(12),
  cotaTotal: 1000,
  cotaReservada: 40,
  cotaConsumida: 674,
};

const POR_DIA = [
  18, 24, 21, 30, 27, 35, 22, 41, 38, 33, 46, 40, 52, 44, 49, 57, 39, 61, 55, 48, 66, 58, 63, 71,
  54, 69, 74, 62, 80, 77,
].map((quantidade, i) => ({ data: isoDia(i - 29).slice(0, 10), quantidade }));

const SEGMENTOS = [
  { segmento: "Odontologia", quantidade: 412 },
  { segmento: "Estética", quantidade: 268 },
  { segmento: "Fisioterapia", quantidade: 187 },
];


/* ------------------------------------------------------------------ */
/* camadas                                                             */
/* ------------------------------------------------------------------ */

function Camada({
  explosao,
  caixa,
  className,
  children,
}: {
  explosao: Explosao;
  caixa: [x: number, y: number, w: number, h: number];
  className?: string;
  children: ReactNode;
}) {
  const [x, y, w, h] = caixa;
  return (
    <div
      data-camada
      data-ex={explosao.x}
      data-ey={explosao.y}
      data-ez={explosao.z}
      data-erot={explosao.rot}
      className={cx("camada-3d absolute", className)}
      style={{ left: x, top: y, width: w, height: h } as CSSProperties}
    >
      {children}
    </div>
  );
}

const NAVEGACAO = [
  IconePainel,
  IconeLeads,
  IconeCapturas,
  IconeVisitantes,
  IconeEmpresa,
  IconeAssinatura,
];

export function Painel3D() {
  return (
    <>
      {/* Base: o casco do app — trilho lateral recolhido e barra do topo. */}
      <Camada caixa={[0, 0, 1440, 900]} explosao={{ x: 0, y: 0, z: 0, rot: 0 }}>
        <div className="vidro-denso size-full overflow-hidden rounded-[28px] shadow-flutuante">
          <div className="flex h-full">
            <aside className="divisa flex w-16 flex-col items-center border-r">
              <div className="divisa flex h-14 w-full items-center justify-center border-b">
                <Image src="/logo-app-icon.png" alt="" width={32} height={32} className="size-8 rounded-lg" />
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                {NAVEGACAO.map((Ic, i) => (
                  <span
                    key={i}
                    className={cx(
                      "grid size-10 place-items-center rounded-xl",
                      i === 0 ? "bg-brand-500/15 text-brand-600" : "text-ink-muted",
                    )}
                  >
                    <Ic className="size-4.5" />
                  </span>
                ))}
              </div>
              <Image
                src="/profiles/perfil_02.png"
                alt=""
                width={32}
                height={32}
                className="mt-auto mb-4 size-8 rounded-full object-cover ring-2 ring-brand-500/20"
              />
            </aside>
            <div className="flex-1">
              <div className="divisa flex h-14 items-center justify-between border-b px-6">
                <p className="text-sm font-semibold text-ink">Dashboard</p>
                <span className="flex h-8 w-64 items-center gap-2 rounded-full border border-line/70 bg-surface/40 px-3 text-xs text-ink-muted">
                  <IconeBusca className="size-3.5" /> Buscar lead, CNPJ…
                </span>
              </div>
            </div>
          </div>
        </div>
      </Camada>

      {/* KPIs: número, selo e a barra — sem as notas de rodapé. */}
      <Camada caixa={[88, 84, 1328, 200]} explosao={{ x: -60, y: -140, z: 220, rot: -4 }}>
        <div className="grid h-full grid-cols-4 gap-4">
          <Kpi
            heroi
            rotulo="Leads capturados"
            valor={1214}
            tom="marca"
            icone={<IconeLeads />}
            pilula={<Variacao atual={146} anterior={124} rotulo="na semana" />}
            rodape={<MiniGrafico serie={[18, 24, 30, 27, 41, 46, 52, 49, 61, 66, 71, 80]} tom="marca" />}
          />
          <Kpi
            rotulo="Score médio da IA"
            valor={87}
            tom="ok"
            icone={<IconeFaisca />}
            pilula={
              <Pilula tom="ok" icone="✓">
                alta aderência
              </Pilula>
            }
            rodape={<Progress valor={87} tom="ok" />}
          />
          <Kpi
            rotulo="Leads ativos"
            valor={932}
            tom="ok"
            icone={<IconeSelo />}
            pilula={<Pilula tom="ok">77% aproveitados</Pilula>}
            rodape={<Progress valor={77} tom="ok" />}
          />
          <Kpi
            rotulo="Cota disponível"
            valor={286}
            tom="info"
            icone={<IconeCiclo />}
            pilula={<Pilula tom="info">de 1.000</Pilula>}
            rodape={<BarraCota ciclo={CICLO} />}
          />
        </div>
      </Camada>

      {/* Captura: o radar varrendo a região. */}
      <Camada caixa={[88, 300, 440, 576]} explosao={{ x: -220, y: 80, z: 380, rot: -6 }}>
        <Card className="flex size-full flex-col">
          <CardHeader
            titulo="Captura"
            acao={<span className="text-xs text-ink-muted">Curitiba/PR · 10 km</span>}
          />
          <CardBody className="flex flex-1 flex-col items-center justify-between">
            <MiniRadar />
            <p className="flex items-baseline gap-2.5 self-start">
              <span className="text-4xl font-bold text-brand-500 tabular-nums">38</span>
              <span className="text-sm text-ink-muted">empresas encontradas</span>
            </p>
          </CardBody>
        </Card>
      </Camada>

      {/* Leads por dia */}
      <Camada caixa={[544, 300, 872, 290]} explosao={{ x: 160, y: -60, z: 300, rot: 5 }}>
        <Card className="flex size-full flex-col">
          <CardHeader titulo="Leads capturados por dia" />
          <CardBody className="flex flex-1 flex-col">
            <BarrasPorDia dados={POR_DIA} altura={150} preencher />
          </CardBody>
        </Card>
      </Camada>

      {/* Segmentos */}
      <Camada caixa={[544, 606, 428, 270]} explosao={{ x: 40, y: 200, z: 260, rot: -3 }}>
        <Card className="flex size-full flex-col">
          <CardHeader titulo="Segmentos com mais leads" />
          <CardBody className="flex-1">
            <RankingSegmentos dados={SEGMENTOS} />
          </CardBody>
        </Card>
      </Camada>

      {/* Melhores leads: nome e nota, nada mais. */}
      <Camada caixa={[988, 606, 428, 270]} explosao={{ x: 240, y: 170, z: 420, rot: 4 }}>
        <Card className="flex size-full flex-col">
          <CardHeader titulo="Leads com maior nota" />
          <CardBody className="flex flex-1 flex-col justify-between py-4">
            {LEADS_DEMO.slice(0, 4).map((l) => (
              <div key={l.nome} className="flex items-center gap-3">
                <Avatar nome={l.nome} />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{l.nome}</p>
                <AnelScore valor={l.score} tamanho={30} />
              </div>
            ))}
          </CardBody>
        </Card>
      </Camada>
    </>
  );
}

/** Radar da captura: varredura girando sobre um campo de pontos. */
function MiniRadar() {
  const rnd = sorteio(9);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const pontos = Array.from({ length: 90 }, (_, i) => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 128;
    return { x: r2(150 + Math.cos(a) * r), y: r2(150 + Math.sin(a) * r), achado: i % 4 === 0 };
  });
  return (
    <svg viewBox="0 0 300 300" className="size-[360px] max-w-full" aria-hidden>
      <defs>
        <linearGradient id="mini-feixe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r="135" fill="none" stroke="var(--color-brand-500)" strokeOpacity="0.35" />
      <circle cx="150" cy="150" r="90" fill="none" stroke="var(--color-ink)" strokeOpacity="0.08" strokeDasharray="2 5" />
      <circle cx="150" cy="150" r="45" fill="none" stroke="var(--color-ink)" strokeOpacity="0.08" strokeDasharray="2 5" />
      <g className="radar-varredura" style={{ transformOrigin: "150px 150px" }}>
        <path d="M150 150 L285 150 A135 135 0 0 0 253.4 63.2 Z" fill="url(#mini-feixe)" />
      </g>
      {pontos.map((p, i) =>
        p.achado ? (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="var(--color-brand-500)" opacity="0.2" />
            <circle cx={p.x} cy={p.y} r="2.4" fill="var(--color-brand-500)" />
          </g>
        ) : (
          <circle key={i} cx={p.x} cy={p.y} r="1" fill="var(--color-ink)" opacity="0.35" />
        ),
      )}
      <circle cx="150" cy="150" r="3.5" fill="var(--color-ink)" />
    </svg>
  );
}
