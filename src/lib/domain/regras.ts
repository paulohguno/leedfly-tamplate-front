import type {
  Assinatura,
  CicloUso,
  Empresa,
  EstadoAcesso,
  Preenchimento,
} from "./types";

/**
 * Regras de negócio replicadas no front apenas para orientar a interface
 * (habilitar botão, mostrar bloqueio, avisar antes de enviar).
 * A validação que vale é sempre a do back-end.
 */

/** RN09 — mínimo de preenchimento do perfil para liberar captura. */
export const MINIMO_PREENCHIMENTO = 80;

/**
 * Campos informativos que entram no cálculo dos 80%.
 * Decisão em aberto na spec (item 7.5): os pesos abaixo são um palpite inicial
 * e precisam ser confirmados com o back-end antes de virar contrato.
 */
export const CAMPOS_PERFIL: { campo: keyof Empresa; rotulo: string; peso: number }[] = [
  { campo: "nome", rotulo: "Nome da empresa", peso: 10 },
  { campo: "cnpj", rotulo: "CNPJ", peso: 10 },
  { campo: "descricao", rotulo: "Descrição do negócio", peso: 10 },
  { campo: "publicoAlvo", rotulo: "Público-alvo", peso: 10 },
  { campo: "propostaValor", rotulo: "Proposta de valor", peso: 10 },
  { campo: "portePreferido", rotulo: "Porte de cliente preferido", peso: 8 },
  { campo: "ticketMedio", rotulo: "Ticket médio", peso: 8 },
  { campo: "cidade", rotulo: "Cidade", peso: 6 },
  { campo: "estado", rotulo: "Estado", peso: 6 },
  { campo: "emailComercial", rotulo: "E-mail comercial", peso: 4 },
  { campo: "telefone", rotulo: "Telefone", peso: 4 },
  { campo: "site", rotulo: "Site", peso: 4 },
];

function preenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (typeof valor === "number") return true;
  return Boolean(valor);
}

/**
 * Espelha GET /empresas/:id/preenchimento. Usado para feedback ao vivo no
 * formulário de perfil, antes de salvar.
 */
export function calcularPreenchimento(empresa: Partial<Empresa>): Preenchimento {
  const pesoTotal = CAMPOS_PERFIL.reduce((soma, c) => soma + c.peso, 0);
  const faltantes = CAMPOS_PERFIL.filter((c) => !preenchido(empresa[c.campo]));
  const pesoFaltante = faltantes.reduce((soma, c) => soma + c.peso, 0);
  const percentual = Math.round(((pesoTotal - pesoFaltante) / pesoTotal) * 100);

  return {
    percentual,
    minimoExigido: MINIMO_PREENCHIMENTO,
    atingiuMinimo: percentual >= MINIMO_PREENCHIMENTO,
    camposFaltantes: faltantes,
  };
}

/** RN14/RN15 — saldo = total − reservada − consumida. */
export function saldoDisponivel(ciclo: CicloUso | null | undefined): number {
  if (!ciclo) return 0;
  return Math.max(0, ciclo.cotaTotal - ciclo.cotaReservada - ciclo.cotaConsumida);
}

export function diasRestantesCiclo(ciclo: CicloUso | null | undefined, agora = new Date()): number {
  if (!ciclo) return 0;
  const fim = new Date(ciclo.dataFim).getTime();
  return Math.max(0, Math.ceil((fim - agora.getTime()) / 86_400_000));
}

/**
 * RN07 + RN09 — decide o que a empresa pode fazer.
 * RN07 vale também para o link de visitante: sem assinatura ativa, o dashboard
 * do visitante também fica bloqueado.
 */
export function avaliarAcesso(params: {
  assinatura: Assinatura | null;
  preenchimento: Preenchimento | null;
  ciclo: CicloUso | null;
}): EstadoAcesso {
  const { assinatura, preenchimento, ciclo } = params;

  const assinaturaAtiva = assinatura?.status === "ativa";
  const percentualPerfil = preenchimento?.percentual ?? 0;
  const perfilCompleto = percentualPerfil >= MINIMO_PREENCHIMENTO;
  const temSaldo = saldoDisponivel(ciclo) > 0;

  const bloqueios: EstadoAcesso["bloqueios"] = [];

  if (!assinaturaAtiva) {
    bloqueios.push({
      regra: "RN07",
      motivo:
        assinatura?.status === "inadimplente"
          ? "A assinatura está inadimplente. Dashboard, leads e links de visitante ficam bloqueados até a regularização."
          : "Nenhuma assinatura ativa no ciclo vigente.",
      acao: { rotulo: "Ver assinatura", href: "assinatura" },
    });
  }

  if (!perfilCompleto) {
    bloqueios.push({
      regra: "RN09",
      motivo: `O perfil empresarial está em ${percentualPerfil}%. A captura exige ao menos ${MINIMO_PREENCHIMENTO}%.`,
      acao: { rotulo: "Completar perfil", href: "perfil" },
    });
  }

  if (assinaturaAtiva && !temSaldo) {
    bloqueios.push({
      regra: "RN14",
      motivo: "O saldo de leads do ciclo acabou. A cota é reposta na virada e não acumula.",
      acao: { rotulo: "Ver ciclo atual", href: "assinatura" },
    });
  }

  return {
    assinaturaAtiva,
    perfilCompleto,
    percentualPerfil,
    podeVerDashboard: assinaturaAtiva,
    podeCapturar: assinaturaAtiva && perfilCompleto && temSaldo,
    bloqueios,
  };
}

/** RN08 — vagas de visitante são contadas por empresa, independentes dos admins. */
export function vagasVisitante(ativos: number, maximo: number) {
  return {
    usadas: ativos,
    disponiveis: Math.max(0, maximo - ativos),
    maximo,
  };
}
