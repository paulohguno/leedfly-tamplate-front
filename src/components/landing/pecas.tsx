import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconeWhatsapp } from "@/components/layout/icones";

/*
 * Peças de interface das cenas da landing — miniaturas fiéis do produto,
 * no mesmo desenho dos vídeos da marca. São decorativas: quem lê a página
 * recebe o texto ao lado, então ficam fora da árvore de acessibilidade
 * sempre que a cena inteira for `aria-hidden`.
 */

export interface LeadDemo {
  nome: string;
  segmento: string;
  bairro: string;
  score: number;
}

export const LEADS_DEMO: LeadDemo[] = [
  { nome: "Odonto Sorriso Batel", segmento: "Odontologia", bairro: "Batel", score: 92 },
  { nome: "Clínica Dental Ahú", segmento: "Odontologia", bairro: "Ahú", score: 87 },
  { nome: "Sorrir Mais Juvevê", segmento: "Odontologia", bairro: "Juvevê", score: 84 },
  { nome: "OralPrime Água Verde", segmento: "Odontologia", bairro: "Água Verde", score: 81 },
  { nome: "Instituto Bucal Cabral", segmento: "Odontologia", bairro: "Cabral", score: 79 },
  { nome: "Odonto Vida Portão", segmento: "Odontologia", bairro: "Portão", score: 74 },
];

export function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Tom do score: verde para aderência alta, âmbar para média, marca para o resto. */
export function corDoScore(score: number) {
  if (score >= 85) return "text-ok";
  if (score >= 78) return "text-warn";
  return "text-laranja";
}

/**
 * Anel de score. O arco se desenha (via `.anel-arco`) quando `ativo` liga;
 * sem `ativo` fica vazio, à espera da cena.
 */
export function AnelScore({
  valor,
  tamanho = 28,
  espessura = 2.5,
  ativo = true,
  className,
  children,
  atraso = 0,
}: {
  valor: number;
  tamanho?: number;
  espessura?: number;
  ativo?: boolean;
  className?: string;
  children?: ReactNode;
  atraso?: number;
}) {
  const raio = (tamanho - espessura) / 2;
  const circ = 2 * Math.PI * raio;
  return (
    <span
      className={cx("relative inline-grid shrink-0 place-items-center", corDoScore(valor), className)}
      style={{ width: tamanho, height: tamanho }}
    >
      <svg width={tamanho} height={tamanho} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={espessura}
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth={espessura}
          strokeLinecap="round"
          data-ativo={ativo}
          className="anel-arco"
          style={
            {
              "--circ": circ,
              "--alvo": circ * (1 - valor / 100),
              strokeDasharray: circ,
              transitionDelay: `${atraso}ms`,
            } as CSSProperties
          }
        />
      </svg>
      <span className="relative text-[10px] font-semibold tabular-nums">{children ?? valor}</span>
    </span>
  );
}

export function Avatar({ nome, className }: { nome: string; className?: string }) {
  return (
    <span
      className={cx(
        "grid size-7 shrink-0 place-items-center rounded-lg border border-brand-500/25 bg-brand-500/12 text-[10px] font-semibold text-brand-700",
        className,
      )}
    >
      {iniciais(nome)}
    </span>
  );
}

/** Linha de lead do funil: avatar, nome, segmento, WhatsApp e score. */
export function LinhaLead({
  lead,
  ativo = true,
  className,
  style,
}: {
  lead: LeadDemo;
  ativo?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx(
        "flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2",
        className,
      )}
      style={style}
    >
      <Avatar nome={lead.nome} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{lead.nome}</p>
        <p className="truncate text-[11px] text-ink-muted">
          {lead.segmento} · {lead.bairro}
        </p>
      </div>
      <IconeWhatsapp className="size-3.5 shrink-0 text-ok" />
      <AnelScore valor={lead.score} ativo={ativo} />
    </div>
  );
}

/** Cabeçalho de janela do produto — três luzes e a trilha da rota. */
export function BarraJanela({ trilha }: { trilha: string }) {
  return (
    <div className="divisa flex items-center gap-3 border-b px-4 py-2.5">
      <span className="flex gap-1.5" aria-hidden>
        <span className="size-2 rounded-full bg-danger/70" />
        <span className="size-2 rounded-full bg-warn/70" />
        <span className="size-2 rounded-full bg-ok/70" />
      </span>
      <span className="truncate font-mono text-[10px] tracking-wide text-ink-muted">{trilha}</span>
    </div>
  );
}
