import type {
  NovaCapturaInput,
  CampoIaConfig,
  TogglesGooglePlaces,
  TogglesCnpj,
  CamposSelecionadosPayload,
} from "./types";

export interface EstadoFormularioCaptura {
  etapa?: 1 | 2 | 3;
  // Parâmetros de busca (Etapa 2)
  nome: string;
  segmento?: string;
  uf?: string;
  textoEstado?: string;
  cidade?: string;
  textoCidade?: string;
  localizacao?: string;
  quantidade: number;
  objetivo?: string;
  raioKm?: number;
  metodoBuscaIaId?: string | null;
  // Toggles de personalização (Etapa 3)
  togglesGooglePlaces?: TogglesGooglePlaces;
  togglesCnpj?: TogglesCnpj;
  // Campo customizado via IA (Etapa 3 - exatamente 1 campo)
  campoIaHabilitado?: boolean;
  campoIaNome?: string;
  campoIaPrompt?: string;
  campoIa?: CampoIaConfig | null;
  // Suporte opcional caso já venha pré-estruturado
  camposSelecionados?: CamposSelecionadosPayload;
  camposGooglePlaces?: string[];
  camposCnpj?: string[];
}

export const ESTADO_INICIAL_CAPTURA: EstadoFormularioCaptura = {
  etapa: 1,
  nome: "",
  segmento: "",
  uf: "",
  textoEstado: "",
  cidade: "",
  textoCidade: "",
  localizacao: "",
  quantidade: 20,
  objetivo: "",
  raioKm: 25,
  togglesGooglePlaces: {
    nome: true,
    telefone: true,
    endereco: true,
    site: true,
    nota: true,
    quantidadeAvaliacoes: true,
    comentarios: false,
    horariosFuncionamento: false,
  },
  togglesCnpj: {
    razaoSocial: true,
    nomeFantasia: true,
    cnpj: true,
    cnaePrincipal: true,
    cnaesSecundarios: false,
    situacaoCadastral: true,
    dataAbertura: false,
    sociosQsa: false,
    capitalSocial: false,
  },
  campoIaHabilitado: false,
  campoIaNome: "",
  campoIaPrompt: "",
  campoIa: null,
};

/**
 * Constrói o payload estritamente filtrado para envio ao endpoint de captura da API.
 *
 * REGRA DE OMISSÃO ESTRITA (STRICT OMISSION RULE):
 * - Toggles desmarcados (false) são COMPLETAMENTE OMITIDOS do payload (nunca envia `false`).
 * - Se nenhum toggle de uma categoria estiver ativo, o grupo correspondente é omitido.
 * - `campoIa` só é incluído se habilitado E se ambos `nome` e `prompt` possuírem texto válido após trim.
 * - Se `campoIa` estiver desabilitado ou incompleto, a chave `campoIa` é completamente omitida.
 * - Campos opcionais vazios (`segmento`, `objetivo`) são omitidos do payload final.
 */
export function construirPayloadCaptura(
  form: EstadoFormularioCaptura,
): NovaCapturaInput {
  // Resolução da localização textual
  let localizacao = form.localizacao?.trim() || "";
  if (!localizacao) {
    if (form.cidade?.trim() && form.uf?.trim()) {
      localizacao = `${form.cidade.trim()}, ${form.uf.trim()}`;
    } else if (form.textoCidade?.trim() && form.textoEstado?.trim()) {
      localizacao = `${form.textoCidade.trim()}, ${form.textoEstado.trim()}`;
    } else if (form.textoCidade?.trim()) {
      localizacao = form.textoCidade.trim();
    } else if (form.cidade?.trim()) {
      localizacao = form.cidade.trim();
    } else {
      localizacao = "Brasil";
    }
  }

  const payload: NovaCapturaInput = {
    nome: form.nome.trim(),
    localizacao,
    quantidade: Number(form.quantidade) || 20,
  };

  if (form.segmento && form.segmento.trim().length > 0) {
    payload.segmento = form.segmento.trim();
  }

  if (form.objetivo && form.objetivo.trim().length > 0) {
    payload.objetivo = form.objetivo.trim();
  }

  if (typeof form.raioKm === "number" && form.raioKm > 0) {
    payload.raioKm = Number(form.raioKm);
  }

  if (form.metodoBuscaIaId) {
    payload.metodoBuscaIaId = form.metodoBuscaIaId;
  }

  // Filtragem estrita dos toggles do Google Places:
  // Apenas as chaves marcadas como `true` são incluídas; falsas são OMITIDAS.
  const googlePlacesAtivos: Record<string, true> = {};
  if (form.togglesGooglePlaces) {
    for (const [chave, ativo] of Object.entries(form.togglesGooglePlaces)) {
      if (ativo === true) {
        googlePlacesAtivos[chave] = true;
      }
    }
  } else if (form.camposSelecionados?.googlePlaces) {
    for (const [chave, ativo] of Object.entries(form.camposSelecionados.googlePlaces)) {
      if (ativo === true) {
        googlePlacesAtivos[chave] = true;
      }
    }
  } else if (form.camposGooglePlaces) {
    for (const campo of form.camposGooglePlaces) {
      if (campo) {
        googlePlacesAtivos[campo] = true;
      }
    }
  }

  // Filtragem estrita dos toggles do CNPJ:
  // Apenas as chaves marcadas como `true` são incluídas; falsas são OMITIDAS.
  const cnpjAtivos: Record<string, true> = {};
  if (form.togglesCnpj) {
    for (const [chave, ativo] of Object.entries(form.togglesCnpj)) {
      if (ativo === true) {
        cnpjAtivos[chave] = true;
      }
    }
  } else if (form.camposSelecionados?.cnpj) {
    for (const [chave, ativo] of Object.entries(form.camposSelecionados.cnpj)) {
      if (ativo === true) {
        cnpjAtivos[chave] = true;
      }
    }
  } else if (form.camposCnpj) {
    for (const campo of form.camposCnpj) {
      if (campo) {
        cnpjAtivos[campo] = true;
      }
    }
  }

  const chavesGooglePlaces = Object.keys(googlePlacesAtivos);
  const chavesCnpj = Object.keys(cnpjAtivos);

  const temGooglePlaces = chavesGooglePlaces.length > 0;
  const temCnpj = chavesCnpj.length > 0;

  if (temGooglePlaces || temCnpj) {
    const camposSelecionados: CamposSelecionadosPayload = {};
    if (temGooglePlaces) {
      camposSelecionados.googlePlaces = googlePlacesAtivos;
      payload.camposGooglePlaces = chavesGooglePlaces;
    }
    if (temCnpj) {
      camposSelecionados.cnpj = cnpjAtivos;
      payload.camposCnpj = chavesCnpj;
    }
    payload.camposSelecionados = camposSelecionados;
  }

  // Configuração estrita do Campo IA (exatamente 1 campo customizado via IA):
  // Incluído APENAS se habilitado e com nome e prompt não-vazios após trim.
  const iaHabilitada = Boolean(
    form.campoIaHabilitado ?? (form.campoIa ? true : false),
  );
  const nomeIa = (form.campoIaNome ?? form.campoIa?.nome ?? "").trim();
  const promptIa = (form.campoIaPrompt ?? form.campoIa?.prompt ?? "").trim();

  if (iaHabilitada && nomeIa.length > 0 && promptIa.length > 0) {
    payload.campoIa = {
      nome: nomeIa,
      prompt: promptIa,
    };
  }

  return payload;
}
