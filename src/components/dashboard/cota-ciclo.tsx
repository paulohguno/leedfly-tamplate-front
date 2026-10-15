"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Contador } from "@/components/motion/contador";
import { diasRestantesCiclo, saldoDisponivel } from "@/lib/domain/regras";
import type { CicloUso } from "@/lib/domain/types";
import { cx, fmt, passo } from "@/lib/format";

/**
 * Visão do ciclo (RN14/RN15). Mostra as três parcelas da cota separadas,
 * porque "reservada" é o que mais confunde: é cota comprometida por uma
 * captura em andamento, ainda passível de devolução.
 */
export function CotaCiclo({ ciclo }: { ciclo: CicloUso | null }) {
  if (!ciclo) {
    return (
      <Card>
        <CardHeader titulo="Ciclo de uso" />
        <CardBody>
          <p className="text-sm text-ink-muted">
            Nenhum ciclo aberto. O ciclo é criado quando a assinatura fica ativa.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader titulo="Ciclo de uso" descricao={periodo(ciclo)} />
      <CardBody>
        <CorpoCota ciclo={ciclo} />
      </CardBody>
    </Card>
  );
}

function periodo(ciclo: CicloUso) {
  return `${fmt.data(ciclo.dataInicio)} — ${fmt.data(ciclo.dataFim)} · ${diasRestantesCiclo(ciclo)} dias restantes`;
}

/**
 * Barra composta da cota: consumida | reservada | livre.
 *
 * O trilho é um passo claro da mesma cor, e o 2px que separa as parcelas é o
 * próprio fundo — nunca um contorno, que acrescentaria tinta sem acrescentar
 * dado. Cada parcela se estende em sequência, na ordem em que a cota é gasta.
 *
 * Exportada à parte porque o mesmo desenho serve de rodapé no card de
 * indicador da faixa, onde não cabe o resto do bloco.
 */
export function BarraCota({ ciclo, className }: { ciclo: CicloUso; className?: string }) {
  const pctUsada = Math.min(
    100,
    Math.max(0, (ciclo.cotaConsumida / Math.max(1, ciclo.cotaTotal)) * 100),
  );

  return (
    <div
      className={cx(
        "flex h-2.5 w-full overflow-hidden rounded-[4px] bg-brand-500/15",
        className,
      )}
    >
      <div
        className="crescendo-h rounded-[4px] bg-brand-500"
        style={{ ...passo(0), width: `${pctUsada}%` }}
      />
    </div>
  );
}

/** O conteúdo sem moldura — usado quando o card externo já existe. */
export function CorpoCota({
  ciclo,
  mostrarPeriodo,
  preencher,
}: {
  ciclo: CicloUso;
  mostrarPeriodo?: boolean;
  /**
   * Distribui os blocos na altura disponível em vez de empilhá-los no topo.
   *
   * Num monitor largo é o card vizinho (a série temporal) que define a altura
   * da faixa, e o conteúdo da cota agarrado ao topo deixava um palmo de vazio
   * no rodapé. Só a partir de `lg`, que é onde existe um vizinho para esticar
   * o card: em coluna única a altura é a do próprio conteúdo.
   */
  preencher?: boolean;
}) {
  const saldo = saldoDisponivel(ciclo);

  return (
    <div
      className={cx(
        "space-y-4",
        preencher && "lg:flex lg:h-full lg:flex-col lg:justify-between lg:gap-4 lg:space-y-0",
      )}
    >
      {mostrarPeriodo && <p className="text-xs text-ink-muted">{periodo(ciclo)}</p>}

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
            <Contador valor={saldo} formatar={fmt.numero} />
          </span>
          <span className="text-xs text-ink-muted">de {fmt.numero(ciclo.cotaTotal)} leads</span>
        </div>

        <BarraCota ciclo={ciclo} className="mt-2" />
      </div>

      <dl className="grid grid-cols-2 gap-4 text-xs">
        <Parcela cor="bg-brand-500" rotulo="Usado" valor={ciclo.cotaConsumida} />
        <Parcela cor="bg-brand-500/20" rotulo="Disponível" valor={saldo} />
      </dl>

      <p className="border-t border-line pt-3 text-xs text-ink-muted">
        A cota de leads é mensal, renovada a cada ciclo e não acumula.
      </p>
    </div>
  );
}

function Parcela({ cor, rotulo, valor }: { cor: string; rotulo: string; valor: number }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-ink-muted">
        <span className={cx("size-2 rounded-full", cor)} />
        {rotulo}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-ink tabular-nums">
        <Contador valor={valor} formatar={fmt.numero} />
      </dd>
    </div>
  );
}
