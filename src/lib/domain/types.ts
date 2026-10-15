/**
 * Tipos do domínio — espelham as tabelas descritas na especificação do back-end.
 * Enquanto a API real não existe, estes tipos são o contrato entre o front e os mocks.
 */

export type UUID = string;
export type ISODate = string;

/* ---------------------------------- conta --------------------------------- */

/** Um de cinco avatares fixos em `public/profiles/` — sem upload nem URL externa. */
export type AvatarId = 1 | 2 | 3 | 4 | 5;

export interface Usuario {
  id: UUID;
  nome: string;
  email: string;
  avatarId: AvatarId;
  aceitaMarketing: boolean;
}

/** RN01 — uma pessoa pode ser admin de uma ou mais empresas. */
export interface VinculoEmpresa {
  empresaId: UUID;
  empresaNome: string;
  nivelPermissao: "admin";
}

/**
 * A sessão não carrega token.
 *
 * A credencial vive num cookie httpOnly, que o navegador envia sozinho e que
 * JavaScript não consegue ler — é o que impede um XSS de roubar a sessão. O que
 * fica do lado do cliente são só os dados de exibição.
 */
export interface SessaoAdmin {
  usuario: Usuario;
  empresas: VinculoEmpresa[];
}

/* --------------------------------- empresa -------------------------------- */

export interface Empresa {
  id: UUID;
  nome: string;
  razaoSocial: string | null;
  cnpj: string | null;
  dataFundacao: ISODate | null;
  porteEmpresa: string | null;
  numeroFuncionarios: number | null;

  site: string | null;
  telefone: string | null;
  emailComercial: string | null;

  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;

  segmento: string | null;

  descricao: string | null;
  principaisProdutos: string | null;
  principaisServicos: string | null;
  ticketMedio: number | null;
  propostaValor: string | null;

  publicoAlvo: string | null;
  perfilClienteIdeal: string | null;
  portePreferido: string | null;

  criadoEm: ISODate;
}

/** Resposta de GET /empresas/:id/preenchimento — RN09. */
export interface Preenchimento {
  percentual: number;
  minimoExigido: number;
  atingiuMinimo: boolean;
  camposFaltantes: { campo: keyof Empresa; rotulo: string; peso: number }[];
}

/* ------------------------------ plano / ciclo ----------------------------- */

export interface Plano {
  id: UUID;
  nome: string;
  precoMensal: number;
  cotaLeadsCiclo: number;
  maximoUsuarios: number;
  /** RN08 — contado de forma independente dos admins. */
  maximoVisitantes: number;
  destaques: string[];
}

/**
 * "pendente" é a assinatura contratada cuja cobrança ainda não compensou.
 *
 * PIX e boleto levam de minutos a dias; o acesso só é liberado quando o webhook
 * do gateway confirmar o pagamento. Sem este estado, a tela não teria como
 * distinguir "acabou de contratar, aguarde" de "não tem assinatura".
 */
export type StatusAssinatura =
  | "ativa"
  | "pendente"
  | "inadimplente"
  | "cancelada"
  | "sem_assinatura";

export interface Assinatura {
  id: UUID;
  empresaId: UUID;
  plano: Plano;
  status: StatusAssinatura;
  iniciadaEm: ISODate;
  renovaEm: ISODate | null;
}

export type MeioPagamento = "pix" | "boleto" | "cartao";

/** Dados do cartão. Trafegam numa única requisição e nunca são persistidos. */
export interface DadosCartao {
  nomeImpresso: string;
  numero: string;
  mesValidade: string;
  anoValidade: string;
  ccv: string;
}

export interface TitularCartao {
  nome: string;
  email: string;
  cpfCnpj: string;
  cep: string;
  numero: string;
  complemento?: string;
  telefone: string;
}

export interface EntradaContratacao {
  planoId: UUID;
  meioPagamento: MeioPagamento;
  cartao?: DadosCartao;
  titular?: TitularCartao;
  tokenCartao?: string;
}

/**
 * O que o cliente precisa para pagar a primeira cobrança.
 *
 * Pode vir `null` quando o gateway aceitou a assinatura mas ainda não devolveu a
 * cobrança — nesse caso resta a `urlFatura`, ou aguardar o webhook.
 */
export interface DadosPagamento {
  cobrancaId: string;
  valor: number;
  vencimento: ISODate;
  urlFatura: string | null;
  pix?: {
    copiaECola: string;
    qrCodeBase64: string;
    expiraEm: ISODate | null;
  };
  boleto?: {
    linhaDigitavel: string;
    codigoBarras: string | null;
    url: string | null;
  };
}

export interface ResultadoContratacao {
  assinatura: Assinatura;
  pagamento: DadosPagamento | null;
}

/** RN14 / RN15 — cota reposta por ciclo, sem acúmulo; reserva conciliada no fim. */
export interface CicloUso {
  id: UUID;
  assinaturaId: UUID;
  empresaId: UUID;
  dataInicio: ISODate;
  dataFim: ISODate;
  cotaTotal: number;
  cotaReservada: number;
  cotaConsumida: number;
}

/* -------------------------------- visitante ------------------------------- */

/**
 * "expirado" é estado próprio, e não um caso de "revogado": um foi o tempo, o
 * outro foi a decisão de alguém. Quem olha a lista precisa da diferença para
 * escolher entre renovar e não renovar.
 */
export type StatusVisitante = "ativo" | "expirado" | "revogado";

/** Cada linha ativa e dentro da validade é uma vaga ocupada. */
export interface AcessoVisitante {
  id: UUID;
  empresaId: UUID;
  nome: string;
  email: string;
  status: StatusVisitante;
  /** Só volta do back-end no momento da criação — nunca é relido depois. */
  linkGerado?: string;
  /** Nulo nos links criados antes da regra de validade: esses não expiram. */
  expiraEm: ISODate | null;
  ultimoAcessoEm: ISODate | null;
  criadoEm: ISODate;
  podeVerDashboard: boolean;
  podeVerLeads: boolean;
  podeEditar: boolean;
}

export interface ContextoVisitante {
  visitante: AcessoVisitante;
  empresa: {
    id: UUID;
    nome: string;
    segmento: string | null;
  };
}

export interface VagasVisitante {
  usadas: number;
  disponiveis: number;
  maximo: number;
}

/* --------------------------------- captura -------------------------------- */

/** `cancelada` é decisão do admin, enquanto ainda na fila ou em busca — as outras quatro são o worker relatando o resultado. */
export type StatusCaptura =
  | "pendente"
  | "processando"
  | "concluida"
  | "parcial"
  | "falhou"
  | "cancelada";

export type GooglePlacesCampo =
  | "nome"
  | "titulo"
  | "telefone"
  | "endereco"
  | "site"
  | "nota"
  | "quantidadeAvaliacoes"
  | "comentarios"
  | "horariosFuncionamento"
  | "horarioFuncionamento"
  | "categoriaGoogle"
  | "latitudeLongitude";

export type CnpjCampo =
  | "razaoSocial"
  | "nomeFantasia"
  | "cnpj"
  | "cnaePrincipal"
  | "cnaesSecundarios"
  | "situacaoCadastral"
  | "dataAbertura"
  | "qsa"
  | "sociosQsa"
  | "capitalSocial"
  | "porte"
  | "naturezaJuridica";

export interface CampoIaConfig {
  nome: string;
  prompt: string;
}

export interface TogglesGooglePlaces {
  nome?: boolean;
  titulo?: boolean;
  telefone?: boolean;
  endereco?: boolean;
  site?: boolean;
  nota?: boolean;
  quantidadeAvaliacoes?: boolean;
  comentarios?: boolean;
  horariosFuncionamento?: boolean;
  horarioFuncionamento?: boolean;
  categoriaGoogle?: boolean;
  latitudeLongitude?: boolean;
  [key: string]: boolean | undefined;
}

export interface TogglesCnpj {
  razaoSocial?: boolean;
  nomeFantasia?: boolean;
  cnpj?: boolean;
  cnaePrincipal?: boolean;
  cnaesSecundarios?: boolean;
  situacaoCadastral?: boolean;
  dataAbertura?: boolean;
  qsa?: boolean;
  sociosQsa?: boolean;
  capitalSocial?: boolean;
  porte?: boolean;
  naturezaJuridica?: boolean;
  [key: string]: boolean | undefined;
}

export interface CamposSelecionadosPayload {
  googlePlaces?: Record<string, true>;
  cnpj?: Record<string, true>;
}

export interface SolicitacaoCaptura {
  id: UUID;
  empresaId: UUID;
  usuarioId: UUID;
  cicloUsoId: UUID;
  metodoBuscaIaId: UUID | null;
  /** Dado por quem pediu a captura — nulo nas capturas de antes desse campo existir. */
  nome: string | null;
  segmento?: string | null;
  localizacao: string;
  latitude: number | null;
  longitude: number | null;
  raioKm: number;
  /** O que a pessoa pediu à IA de busca, em texto livre — contexto de registro, não usado em regra alguma. */
  objetivo: string | null;
  quantidadeSolicitada: number;
  quantidadeEntregue: number;
  status: StatusCaptura;
  erro: string | null;
  camposSelecionados?: CamposSelecionadosPayload | null;
  camposGooglePlaces?: string[];
  camposCnpj?: string[];
  campoIa?: CampoIaConfig | null;
  criadoEm: ISODate;
  concluidoEm: ISODate | null;
}

export interface NovaCapturaInput {
  nome: string;
  segmento?: string;
  localizacao: string;
  quantidade: number;
  /** Intenção da busca em texto livre. */
  objetivo?: string;
  /** Opcional agora que a tela pede cidade, não raio; o servidor aplica um padrão quando ausente. */
  raioKm?: number;
  metodoBuscaIaId?: UUID | null;
  camposSelecionados?: CamposSelecionadosPayload;
  camposGooglePlaces?: string[];
  camposCnpj?: string[];
  campoIa?: CampoIaConfig | null;
}

/** Retorno da importação de uma lista de clientes já existentes (RN16 por importação). */
export interface ImportacaoClientesExistentes {
  totalLinhas: number;
  importados: number;
  jaBloqueados: number;
  invalidas: number;
}

export interface MetodoBuscaIa {
  id: UUID;
  nome: string;
  descricao: string;
}

/* ---------------------------------- ibge ---------------------------------- */

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Municipio {
  id: number;
  nome: string;
}

/* ---------------------------------- lead ---------------------------------- */

export type StatusLead = "ativo" | "descartado";

/**
 * Tag de funil (CRM), manual e independente de `status` — ver
 * docs/adr/0003-situacao-crm-do-lead.md. Não afeta RN07/RN10/RN16.
 */
export type SituacaoLead =
  | "novo"
  | "contato_realizado"
  | "em_conversa"
  | "interessado"
  | "reuniao"
  | "proposta_enviada"
  | "convertido"
  | "errado"
  | "perdido";

export interface Lead {
  id: UUID;
  empresaId: UUID;
  solicitacaoId: UUID;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  segmento: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  email: string | null;
  site: string | null;
  endereco?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  dadosFiscais?: Record<string, any> | null;
  dadosMaps?: Record<string, any> | null;
  /** RN12 — pontuação de compatibilidade atribuída pela IA. */
  scoreIa: number;
  justificativaIa: string | null;
  status: StatusLead;
  situacao: SituacaoLead;
  /** Data (sem hora, "AAAA-MM-DD") da próxima ação com o lead — o admin marca e remarca; `null` = sem data. */
  proximaAcaoEm: string | null;
  /** Nota livre sobre o lead, qualquer etapa — editada no cartão do Kanban ou na ficha. */
  nota: string | null;
  /** Horário ("HH:MM") da reunião marcada — só faz sentido com `situacao === "reuniao"`. */
  horarioReuniao: string | null;
  /** Valor (R$) da proposta enviada — só faz sentido com `situacao === "proposta_enviada"`. */
  valorProposta: number | null;
  /** Motivo da perda ou da captura errada — só faz sentido com `situacao === "perdido" | "errado"`. */
  motivoPerda: string | null;
  /** Card de lembrete pendurado no lead (um por vez) — `null`/ausente = nenhum. */
  cardId?: UUID | null;
  capturadoEm: ISODate;
  descartadoEm: ISODate | null;
}

/* ------------------------------ cards (lembrete) ----------------------------- */

/** Tons aceitos por um card — os do design system, menos "neutro". */
export type CorCard = "marca" | "info" | "ok" | "atencao" | "perigo" | "indigo" | "rosa" | "laranja";

/**
 * Etiqueta que a empresa cria ("Paulo", "Ligar sexta") e pendura em leads,
 * como um post-it por cima do cartão. Organização interna: visitante não vê.
 */
export interface CardLembrete {
  id: UUID;
  empresaId: UUID;
  nome: string;
  cor: CorCard;
  criadoEm: ISODate | null;
}

/* ---------------------------------- whatsapp --------------------------------- */

/**
 * Estado da integração oficial (WhatsApp Cloud API) da empresa. Opcional:
 * sem ela, o lead só oferece o link wa.me; com ela, também a conversa
 * dentro da plataforma ("Emular").
 */
export interface ConexaoWhatsapp {
  /** O servidor tem o app da Meta configurado? Sem isso nem dá pra conectar. */
  disponivel: boolean;
  conectado: boolean;
  status: "conectado" | "desconectado" | "erro";
  numero: string | null;
  nomeVerificado: string | null;
  conectadoEm: ISODate | null;
  /** `true` enquanto a integração roda simulada no navegador, sem a Meta. */
  simulado: boolean;
  embeddedSignup: { appId: string; configId: string; graphVersion: string } | null;
}

export type StatusMensagemWhatsapp = "pendente" | "enviada" | "entregue" | "lida" | "falhou" | "recebida";

export interface MensagemWhatsapp {
  id: UUID;
  conversaId: UUID;
  direcao: "entrada" | "saida";
  tipo: string;
  texto: string | null;
  template: string | null;
  status: StatusMensagemWhatsapp;
  erro: string | null;
  em: ISODate;
}

export interface ConversaWhatsapp {
  id: UUID;
  leadId: UUID | null;
  contatoWaId: string;
  contatoNome: string | null;
  /** Até quando a Meta aceita texto livre (24h após a última msg do contato); `null` = fechada. */
  janelaAbertaAte: ISODate | null;
  optInEm: ISODate | null;
  naoLidas: number;
  mensagens: MensagemWhatsapp[];
}

/** Linha da caixa de entrada (barra lateral estilo WhatsApp Web). */
export interface ResumoConversaWhatsapp {
  id: UUID;
  leadId: UUID | null;
  contatoWaId: string;
  contatoNome: string | null;
  janelaAbertaAte: ISODate | null;
  naoLidas: number;
  ultimaMensagem: MensagemWhatsapp | null;
}

export interface TemplateWhatsapp {
  nome: string;
  idioma: string;
  categoria: string;
  corpo: string | null;
}

export type EnvioWhatsapp =
  | { tipo: "texto"; texto: string }
  | {
      tipo: "template";
      template: { nome: string; idioma: string; parametros?: string[] };
      optInConfirmado?: boolean;
    };

export interface EventoWhatsapp {
  tipo: "mensagem" | "status";
  leadId: UUID | null;
  mensagem: MensagemWhatsapp;
}

export interface FiltroLeads {
  busca?: string;
  status?: StatusLead;
  situacao?: SituacaoLead;
  scoreMinimo?: number;
  /** Ordena pelo score da IA em vez da ordem padrão (mais recente primeiro). */
  ordenarScore?: "asc" | "desc";
  solicitacaoId?: UUID;
  pagina?: number;
  porPagina?: number;
}

export interface Paginado<T> {
  itens: T[];
  total: number;
  pagina: number;
  porPagina: number;
}

/** Resposta de GET /empresas/:id/leads — a contagem por situação reflete busca/status/score já aplicados, não `situacao` (é o que permite mostrar a distribuição inteira mesmo com um recorte ativo). */
export interface PaginadoLeads extends Paginado<Lead> {
  porSituacao: Record<SituacaoLead, number>;
}

/* -------------------------------- dashboard ------------------------------- */

export interface FiltroDashboard {
  capturaId?: UUID;
  dataInicio?: string;
  dataFim?: string;
  dias?: number;
  local?: string;
  estado?: string;
  cidade?: string;
}

export interface OpcaoLocalFiltro {
  cidade: string;
  estado: string;
  totalLeads?: number;
}

export interface ResumoDashboard {
  empresa: Pick<Empresa, "id" | "nome" | "segmento">;
  totalLeads: number;
  leadsAtivos: number;
  leadsDescartados: number;
  scoreMedio: number;
  ciclo: CicloUso | null;
  leadsPorDia: { data: ISODate; quantidade: number }[];
  topSegmentos: { segmento: string; quantidade: number }[];
  /**
   * Massa dos leads ativos por faixa de score — as faixas da RN12.
   *
   * O score médio sozinho esconde a forma da distribuição: 75 pode ser uma
   * base homogênea ou dois blocos, um ótimo e um ruim, que se anulam na média.
   */
  distribuicaoScore: { faixa: string; quantidade: number }[];
  /** Quantos leads ativos estão em cada situação de funil (CRM) — ver ADR 0003. */
  leadsPorSituacao: Record<SituacaoLead, number>;
  /**
   * Quantas capturas o ciclo teve, no total.
   *
   * Campo próprio porque `ultimasCapturas` é uma prévia truncada: contar o
   * tamanho dela dava um KPI que travava no limite da prévia e mostrava "5"
   * para uma empresa com doze capturas.
   */
  capturasNoPeriodo: number;
  /** Capturas ainda pendentes ou processando neste instante. */
  capturasEmAndamento: number;
  ultimasCapturas: SolicitacaoCaptura[];
  leadsRecentes: Lead[];
  /** Opções agregadas para os filtros dinâmicos de captura e locais */
  opcoesFiltros?: {
    capturas: SolicitacaoCaptura[];
    locais: OpcaoLocalFiltro[];
  };
  /** Filtros que geraram o resumo atual */
  filtrosAplicados?: FiltroDashboard;
  /**
   * Soma do `valorProposta` dos leads em "Proposta enviada" — dado comercial,
   * por isso ausente (não só vazio) na resposta do dashboard do visitante.
   */
  valorPropostasAbertas?: { total: number; quantidadeLeads: number };
  /**
   * Leads em "Perdido"/"Errado" agrupados por `motivoPerda`, do mais ao menos
   * frequente — mesma ausência no visitante que `valorPropostasAbertas`.
   */
  motivosPerda?: { motivo: string; quantidade: number }[];
}

/* ---------------------------- controle de acesso --------------------------- */

/** Resultado do gate que combina RN07 (assinatura) e RN09 (perfil 80%). */
export interface EstadoAcesso {
  assinaturaAtiva: boolean;
  perfilCompleto: boolean;
  percentualPerfil: number;
  podeVerDashboard: boolean;
  podeCapturar: boolean;
  bloqueios: { regra: string; motivo: string; acao?: { rotulo: string; href: string } }[];
}

export type { EstadoFormularioCaptura } from "./captura-payload";
export { ESTADO_INICIAL_CAPTURA, construirPayloadCaptura } from "./captura-payload";

