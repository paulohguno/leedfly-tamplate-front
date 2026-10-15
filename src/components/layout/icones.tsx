import type { SVGProps } from "react";

/**
 * Jogo de ícones da navegação.
 *
 * Desenhados aqui em vez de importados: o projeto não carrega biblioteca de
 * ícones, e um pacote inteiro para seis glifos seria peso morto no bundle.
 *
 * Regras do conjunto — o que faz seis desenhos parecerem um jogo só:
 *   · caixa de 24, traço de 1.5 e pontas arredondadas em todos;
 *   · sem preenchimento, exceto pontos de destaque;
 *   · metáforas do domínio (radar para captura, elo para link de visitante),
 *     nunca as óbvias de sempre.
 */
type PropsIcone = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: PropsIcone) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Painel: blocos de tamanhos diferentes — o próprio bento da tela. */
export function IconePainel(props: PropsIcone) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="8" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="15" width="8" height="6" rx="1.5" />
    </Base>
  );
}

/** Leads: fichas empilhadas, cada uma com seu marcador. */
export function IconeLeads(props: PropsIcone) {
  return (
    <Base {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="7.5" cy="9" r="1.25" />
      <circle cx="7.5" cy="14.5" r="1.25" />
      <path d="M11.5 9h6M11.5 14.5h4" />
    </Base>
  );
}

/** Capturas: radar varrendo a partir de um ponto. */
export function IconeCapturas(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8a6 6 0 0 1 0 8.4" />
      <path d="M19 5a10 10 0 0 1 0 14" />
      <path d="M7.8 16.2a6 6 0 0 1 0-8.4" />
      <path d="M5 19a10 10 0 0 1 0-14" />
    </Base>
  );
}

/** Visitantes: elo — o acesso é um link nominal, não uma conta. */
export function IconeVisitantes(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    </Base>
  );
}

/** Perfil empresarial: fachada com janelas. */
export function IconeEmpresa(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M4 21V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15" />
      <path d="M15 10h3a2 2 0 0 1 2 2v9" />
      <path d="M8 8.5h3M8 12.5h3M8 16.5h3" />
      <path d="M3 21h18" />
    </Base>
  );
}

/** Assinatura: cartão com a tarja. */
export function IconeAssinatura(props: PropsIcone) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 14.5h3" />
    </Base>
  );
}

/** Sair: porta com a seta indo embora. */
export function IconeSair(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16l-4-4 4-4" />
      <path d="M6 12h9" />
    </Base>
  );
}

/* ------------------------------------------------------------------ *
 * Ícones de indicador
 *
 * Mesma gramática dos de navegação (caixa 24, traço 1.5, pontas
 * arredondadas), mas com um trabalho diferente: aqui o glifo mora dentro de
 * um tile tingido e é lido antes do rótulo, então precisa ler bem em 20px.
 * Por isso são mais simples — menos traços, formas maiores.
 * ------------------------------------------------------------------ */

/** Score da IA: faísca. O vocabulário de "gerado por modelo", não uma estrela de favorito. */
export function IconeFaisca(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M12 3.5 13.7 8.3 18.5 10 13.7 11.7 12 16.5 10.3 11.7 5.5 10 10.3 8.3 12 3.5Z" />
      <path d="M18 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </Base>
  );
}

/** Leads ativos: selo de aprovado — o lead que passou pela validação. */
export function IconeSelo(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.4 12.2l2.5 2.5 4.7-5" />
    </Base>
  );
}

/** Saldo do ciclo: a seta que volta ao começo — a cota se repõe na virada (RN14). */
export function IconeCiclo(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.9-6.4" />
      <path d="M20.5 4v4.6h-4.6" />
      <path d="M12 8v4.4l3 1.8" />
    </Base>
  );
}

/** Segmentos: a própria rosca, com a fatia destacada. */
export function IconeRosca(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.5v5" />
      <path d="M19.4 16.2l-4.3-2.5" />
    </Base>
  );
}

/** Admins do plano: duas figuras — a conta é de gente, não de assentos. */
export function IconeEquipe(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="9.5" cy="8" r="3.25" />
      <path d="M3.5 19.5a6 6 0 0 1 12 0" />
      <path d="M16.5 5.4a3.25 3.25 0 0 1 0 5.2" />
      <path d="M18 14.4a6 6 0 0 1 2.5 5.1" />
    </Base>
  );
}

/** Degrau acima: o plano que amplia a cota. Seta subindo de um patamar. */
export function IconeSubir(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M12 19V6" />
      <path d="M7 11l5-5 5 5" />
    </Base>
  );
}

/* ------------------------------------------------------------------ *
 * Ícones de controle e de linha
 *
 * Os menores do jogo: vivem em 14 a 16px, dentro de campos, chips e células.
 * Nesse corpo o traço de 1.5 já é grosso demais para formas fechadas, então
 * aqui eles são mais abertos — menos curvas, mais espaço interno.
 * ------------------------------------------------------------------ */

/** Busca: a lente e o cabo. */
export function IconeBusca(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Base>
  );
}

/** Aumentar zoom: a lente da busca com um "+" dentro — mesma metáfora, gesto oposto ao de menos. */
export function IconeLupaMais(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L21 21" />
      <path d="M10.5 7.8v5.4M7.8 10.5h5.4" />
    </Base>
  );
}

/** Diminuir zoom: a mesma lente, só com o "−" — as duas sempre andam em par. */
export function IconeLupaMenos(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L21 21" />
      <path d="M7.8 10.5h5.4" />
    </Base>
  );
}

/** Expandir: quatro pontas abrindo para os cantos — o painel crescendo pra tela toda. */
export function IconeExpandir(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
    </Base>
  );
}

/** Recolher: a mesma ideia de `IconeExpandir`, com as pontas fechando pra dentro. */
export function IconeRecolher(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M4 9h5V4M15 4v5h5M20 15h-5v5M9 20v-5H4" />
    </Base>
  );
}

/** Arrastar para reordenar: seis pontos em duas colunas — a alça clássica de drag handle. */
export function IconeArrastar(props: PropsIcone) {
  return (
    <Base {...props} fill="currentColor" stroke="none">
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </Base>
  );
}

/** Telefone: o fone inclinado, como em qualquer lugar — aqui a metáfora óbvia
    é a certa, porque o glifo precisa ser lido em 14px sem rótulo. */
export function IconeTelefone(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6L16.5 13l4 1.5v3a2.5 2.5 0 0 1-2.8 2.5A15.5 15.5 0 0 1 4 6.3 2.5 2.5 0 0 1 6.5 3.5Z" />
    </Base>
  );
}

/** WhatsApp: balão com fone interno */
export function IconeWhatsapp(props: PropsIcone) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

/** E-mail: envelope com a aba aberta. */
export function IconeEnvelope(props: PropsIcone) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3.5 7.5l8.5 5.5 8.5-5.5" />
    </Base>
  );
}

/** Olho aberto: mostrar a senha em texto puro. */
export function IconeOlho(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

/** Olho riscado: senha oculta atrás de pontos. */
export function IconeOlhoFechado(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M3 3l18 18" />
      <path d="M9.9 4.24A10.4 10.4 0 0 1 12 4c6.5 0 10 7 10 7a15.7 15.7 0 0 1-2.9 3.9M6.5 6.5C3.6 8.5 2 11 2 11s3.5 7 10 7a10 10 0 0 0 4-.8" />
      <path d="M9.9 10.1a3 3 0 0 0 4.1 4" />
    </Base>
  );
}

/**
 * Chevron apontando para baixo.
 *
 * Serve ao select e, girado por classe, à paginação — um desenho só para os
 * dois evita duas setas ligeiramente diferentes na mesma tela.
 */
export function IconeChevron(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Base>
  );
}

/** Fechar: o X dos chips de filtro. */
export function IconeFechar(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M7 7l10 10M17 7L7 17" />
    </Base>
  );
}

export function IconeMais(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

/** Nota: uma folha com linhas de texto — o mesmo glifo de "anotação" em qualquer jogo de ícones. */
export function IconeNota(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M8 12h8M8 16h5" />
    </Base>
  );
}

/** Moeda: um círculo com o traço vertical do cifrão — valor em dinheiro. */
export function IconeMoeda(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M14.5 9.5c0-1.1-1.1-2-2.5-2s-2.5.9-2.5 2 1.1 1.8 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2-2.5-.9-2.5-2" />
    </Base>
  );
}

/** Fixar o trilho aberto: alfinete. */
export function IconeAlfinete({ fixado, ...props }: PropsIcone & { fixado?: boolean }) {
  return (
    <Base {...props}>
      <path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5Z" fill={fixado ? "currentColor" : "none"} />
      <path d="M12 14v6" />
    </Base>
  );
}

/** Importar arquivo: seta subindo para uma bandeja — o gesto de soltar um arquivo. */
export function IconeUpload(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M12 15V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </Base>
  );
}

/** Lista de clientes: folha com linhas de texto e a dobra do canto. */
export function IconeLista(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M8.5 12h7M8.5 15.5h7M8.5 8.5h3" />
    </Base>
  );
}

/** Site: globo com os meridianos — a metáfora universal de "na web". */
export function IconeGlobo(props: PropsIcone) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </Base>
  );
}

/** Cidade: alfinete de mapa — onde o lead está. */
export function IconeMapa(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </Base>
  );
}

/** Data de captura: página de calendário com a argola no topo. */
export function IconeCalendario(props: PropsIcone) {
  return (
    <Base {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </Base>
  );
}

/** Copiar: duas folhas sobrepostas — feedback vira o ✓ do IconeSelo ao clicar. */
export function IconeCopiar(props: PropsIcone) {
  return (
    <Base {...props}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </Base>
  );
}

/** Agenda: grade com uma linha e uma coluna em destaque — situação cruzando com data, a própria ideia da grade combinada. */
export function IconeGrade(props: PropsIcone) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" opacity="0.35" />
    </Base>
  );
}

/** Redimensionar: três traços diagonais crescentes no canto — a alça clássica de "puxe aqui" de qualquer janela de sistema. */
export function IconeRedimensionar(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M20 9v11H9" />
      <path d="M20 20L4 4" />
      <path d="M20 14.5L14.5 20" />
    </Base>
  );
}

/** Filtro: funil — o gesto universal de afunilar uma lista grande até o que interessa. */
export function IconeFiltro(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M4 5h16l-6 7.5v6L10 21v-8.5L4 5Z" />
    </Base>
  );
}

/** Redimensionar verticalmente: duas pontas de seta se afastando — puxe pra baixo pra crescer, pra cima pra encolher. */
export function IconeRedimensionarVertical(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M8 9.5L12 5.5L16 9.5" />
      <path d="M8 14.5L12 18.5L16 14.5" />
    </Base>
  );
}

/** Etiqueta: o card de lembrete pendurado num lead — um rótulo com o furo do barbante. */
export function IconeEtiqueta(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M3 12.2V4a1 1 0 0 1 1-1h8.2a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-8.2 8.2a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Enviar: o avião de papel de qualquer campo de mensagem. */
export function IconeEnviar(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M21 3 10 14" />
      <path d="M21 3l-7 18-4-7-7-4 18-7Z" />
    </Base>
  );
}

/** Conversa: dois balões sobrepostos — falar com o lead aqui dentro, não lá fora. */
export function IconeConversa(props: PropsIcone) {
  return (
    <Base {...props}>
      <path d="M4 15V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8l-4 3Z" />
      <path d="M16 9h3a1 1 0 0 1 1 1v10l-4-3h-6a1 1 0 0 1-1-1v-1" />
    </Base>
  );
}
