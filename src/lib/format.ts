import type { CSSProperties } from "react";

const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const dataLonga = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");

export const fmt = {
  data: (iso: string | null | undefined) => (iso ? dataLonga.format(new Date(iso)) : "—"),
  dataCurta: (iso: string) => dataCurta.format(new Date(iso)),
  dataHora: (iso: string | null | undefined) => (iso ? dataHora.format(new Date(iso)) : "—"),
  moeda: (valor: number | null | undefined) => (valor == null ? "—" : moeda.format(valor)),
  numero: (valor: number) => numero.format(valor),
  percentual: (valor: number) => `${Math.round(valor)}%`,
  /** Tempo de espera curto, do jeito que se fala: "45 s", "2 min", "2 min 30 s". */
  espera: (segundos: number) => {
    if (segundos < 60) return `${segundos} s`;
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;
    return resto ? `${minutos} min ${resto} s` : `${minutos} min`;
  },
  cnpj: (valor: string) =>
    valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"),
  telefone: (valor: string | null) => valor ?? "—",
};

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Posição na cascata de entrada. A utilitária `.cascata` lê `--i` e converte
 * em atraso de animação, então o filho de índice 3 entra 180ms depois do
 * primeiro. Escrever o índice aqui evita espalhar `as CSSProperties` pelas telas.
 */
export function passo(indice: number): CSSProperties {
  return { "--i": indice } as CSSProperties;
}
