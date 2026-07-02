/* ===========================================================
   VOLANTE APP — HOME.JS
   Finalidade:
   Carregar e renderizar a Home pública do Volante.

   Referência:
   Plano Diretor Oficial + Protótipo Web Oficial.

   Responsabilidades:
   - Buscar anúncios e eventos ativos no Firestore.
   - Normalizar destaque dos anúncios.
   - Aplicar busca local.
   - Separar anúncios por região.
   - Renderizar Escolha do Volante, Recentes e Agenda de Eventos.
   - Ocultar seções sem conteúdo.
   - Preservar compatibilidade com components.js.
=========================================================== */

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

import {
  normalizar,
  getDataMs,
  getImagem
} from "./shared.js";

import {
  cardAnuncio,
  renderizarGrid
} from "./components.js";

/* ===========================================================
   01. ELEMENTOS DA HOME
=========================================================== */

const buscaInput = document.getElementById("busca");
const filtroRegiao = document.getElementById("filtroRegiao");
const filtroTipo = document.getElementById("filtroTipo");

const grids = {
  escolhaVolante: document.getElementById("gridEscolhaVolante"),
  recentes: document.getElementById("gridRecentes"),
  centroOeste: document.getElementById("gridCentroOeste"),
  sudeste: document.getElementById("gridSudeste"),
  sul: document.getElementById("gridSul"),
  nordeste: document.getElementById("gridNordeste"),
  norte: document.getElementById("gridNorte"),
  eventosCentroOeste: document.getElementById("gridEventosCentroOeste"),
  eventosSudeste: document.getElementById("gridEventosSudeste"),
  eventosSul: document.getElementById("gridEventosSul"),
  eventosNordeste: document.getElementById("gridEventosNordeste"),
  eventosNorte: document.getElementById("gridEventosNorte")
};

let anuncios = [];
let eventos = [];

const mediaMobile = window.matchMedia("(max-width: 620px)");

/* ===========================================================
   02. REGIÕES E ESTADOS
=========================================================== */

const REGIOES = {
  centroOeste: ["GO", "DF", "MT", "MS"],
  sudeste: ["SP", "RJ", "MG", "ES"],
  sul: ["PR", "SC", "RS"],
  nordeste: ["BA", "PE", "CE", "RN", "PB", "AL", "SE", "PI", "MA"],
  norte: ["AM", "PA", "RO", "RR", "TO", "AC", "AP"]
};

const UFS_VALIDAS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const ESTADO_POR_NOME = {
  ACRE: "AC",
  ALAGOAS: "AL",
  AMAPA: "AP",
  AMAZONAS: "AM",
  BAHIA: "BA",
  CEARA: "CE",
  DISTRITO_FEDERAL: "DF",
  BRASILIA: "DF",
  ESPIRITO_SANTO: "ES",
  GOIAS: "GO",
  MARANHAO: "MA",
  MATO_GROSSO: "MT",
  MATO_GROSSO_DO_SUL: "MS",
  MINAS_GERAIS: "MG",
  PARA: "PA",
  PARAIBA: "PB",
  PARANA: "PR",
  PERNAMBUCO: "PE",
  PIAUI: "PI",
  RIO_DE_JANEIRO: "RJ",
  RIO_GRANDE_DO_NORTE: "RN",
  RIO_GRANDE_DO_SUL: "RS",
  RONDONIA: "RO",
  RORAIMA: "RR",
  SANTA_CATARINA: "SC",
  SAO_PAULO: "SP",
  SERGIPE: "SE",
  TOCANTINS: "TO"
};

const MESES = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

/* ===========================================================
   03. EVENTOS DE INTERAÇÃO
=========================================================== */

if (buscaInput) {
  buscaInput.addEventListener("input", renderizarTudo);

  buscaInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      executarBuscaGlobal();
    }
  });
}

mediaMobile.addEventListener("change", renderizarTudo);

window.buscarHome = executarBuscaGlobal;

/* ===========================================================
   04. REGRAS DE NEGÓCIO
=========================================================== */

function statusAtivo(item) {
  return String(item.status || "")
    .trim()
    .toUpperCase() === "ATIVO";
}

function anuncioEmDestaque(item) {
  return (
    item.destaque === true ||
    item.destacado === true ||
    item.emDestaque === true ||
    item.destaqueAtivo === true ||
    String(item.destaque || "").toLowerCase() === "true" ||
    String(item.destacado || "").toLowerCase() === "true" ||
    String(item.emDestaque || "").toLowerCase() === "true" ||
    String(item.destaqueAtivo || "").toLowerCase() === "true"
  );
}

function normalizarAnuncio(item) {
  const destaque = anuncioEmDestaque(item);

  return {
    ...item,
    destaque,
    destacado: destaque,
    emDestaque: destaque,
    destaqueAtivo: destaque
  };
}

function ordenarPorData(a, b) {
  return getDataMs(b) - getDataMs(a);
}

function ordenarEventosAgenda(a, b) {
  return getDataMs(a) - getDataMs(b);
}

function ordenarDestaques(a, b) {
  const destaqueA = anuncioEmDestaque(a) ? 1 : 0;
  const destaqueB = anuncioEmDestaque(b) ? 1 : 0;

  if (destaqueA !== destaqueB) {
    return destaqueB - destaqueA;
  }

  return ordenarPorData(a, b);
}

/* ===========================================================
   05. FILTROS
=========================================================== */

function filtrar(lista) {
  const termo = normalizar(buscaInput?.value || "");

  const somenteComImagem = lista.filter((item) => !!getImagem(item));

  if (!termo) {
    return somenteComImagem;
  }

  return somenteComImagem.filter((item) => {
    const texto = normalizar([
      item.titulo,
      item.nome,
      item.marca,
      item.modelo,
      item.descricao,
      item.cidade,
      item.estado,
      item.uf,
      item.preco
    ].join(" "));

    return texto.includes(termo);
  });
}

function filtrarEventos(lista) {
  const termo = normalizar(buscaInput?.value || "");

  if (!termo) {
    return lista;
  }

  return lista.filter((item) => {
    const texto = normalizar([
      item.titulo,
      item.nome,
      item.descricao,
      item.cidade,
      item.estado,
      item.uf,
      item.local,
      item.categoria,
      item.tipo
    ].join(" "));

    return texto.includes(termo);
  });
}

function limparEstado(valor) {
  return normalizar(String(valor || ""))
    .trim()
    .toUpperCase()
    .replaceAll("-", " ")
    .replaceAll("/", " ")
    .replaceAll(".", " ")
    .replace(/\s+/g, " ");
}

function obterUF(item) {
  const candidatos = [
    item.uf,
    item.estado
  ];

  for (const candidato of candidatos) {
    const texto = limparEstado(candidato);

    if (!texto) continue;

    const partes = texto.split(" ");

    for (const parte of partes) {
      if (UFS_VALIDAS.includes(parte)) {
        return parte;
      }
    }

    const chaveEstado = texto.replaceAll(" ", "_");

    if (ESTADO_POR_NOME[chaveEstado]) {
      return ESTADO_POR_NOME[chaveEstado];
    }
  }

  return "";
}

function filtrarRegiao(lista, estados) {
  return lista.filter((item) => estados.includes(obterUF(item)));
}

/* ===========================================================
   06. CONTROLE DE SEÇÕES
=========================================================== */

function controlarSecao(idGrid, lista) {
  const grid = document.getElementById(idGrid);

  if (!grid) return;

  const secao = grid.closest("section");

  if (!secao) return;

  secao.style.display = lista.length ? "block" : "none";
}

function limitarLista(lista, limiteDesktop, limiteMobile = limiteDesktop) {
  return lista.slice(0, mediaMobile.matches ? limiteMobile : limiteDesktop);
}

/* ===========================================================
   07. RENDERIZAÇÃO DE CARDS
=========================================================== */

function renderizarCarrossel(grid, lista, renderCard, mensagemVazia) {
  if (!grid) return;

  grid.className = "carousel-1linha";

  if (!lista.length) {
    renderizarGrid(grid, lista, renderCard, mensagemVazia);
    return;
  }

  grid.innerHTML = `
    <div class="home-linha-horizontal">
      ${lista.map((item) => renderCard(item)).join("")}
    </div>
  `;
}

function renderizarEscolhaVolante(grid, lista) {
  if (!grid) return;

  grid.className = "mosaico-escolha";

  if (!lista.length) {
    grid.innerHTML = "";
    return;
  }

  const selecionados = limitarLista(lista, 3, 6);

  grid.classList.add(`mosaico-qtd-${selecionados.length}`);

  if (mediaMobile.matches) {
    grid.innerHTML = `
      <div class="home-linha-horizontal escolha-mobile">
        ${selecionados.map((item) => cardAnuncio(item, true)).join("")}
      </div>
    `;

    return;
  }

  grid.innerHTML = selecionados
    .map((item, index) => {
      const classe = index === 0
        ? "mosaico-item mosaico-principal"
        : "mosaico-item mosaico-secundario";

      return `
        <div class="${classe}">
          ${cardAnuncio(item, true)}
        </div>
      `;
    })
    .join("");
}

function renderizarSecao(
  idGrid,
  grid,
  lista,
  renderCard,
  mensagemVazia,
  limiteDesktop = 8,
  limiteMobile = 8
) {
  const listaLimitada = limitarLista(lista, limiteDesktop, limiteMobile);

  controlarSecao(idGrid, listaLimitada);

  renderizarCarrossel(grid, listaLimitada, renderCard, mensagemVazia);
}

/* ===========================================================
   08. AGENDA DE EVENTOS
=========================================================== */

function dataEventoMs(item) {
  return getDataMs(item);
}

function dataEventoFormatada(item) {
  const ms = dataEventoMs(item);

  if (!ms || Number.isNaN(ms)) {
    return {
      dia: "--",
      mes: "DATA"
    };
  }

  const data = new Date(ms);

  return {
    dia: String(data.getDate()).padStart(2, "0"),
    mes: MESES[data.getMonth()] || "DATA"
  };
}

function tituloEvento(item) {
  return String(
    item.titulo ||
    item.nome ||
    "Evento Volante"
  ).trim();
}

function localEvento(item) {
  const cidade = String(item.cidade || "").trim();
  const uf = obterUF(item);
  const local = String(item.local || "").trim();

  if (cidade && uf) return `${cidade}, ${uf}`;
  if (cidade) return cidade;
  if (uf) return uf;
  if (local) return local;

  return "Local a confirmar";
}

function categoriaEvento(item) {
  return String(
    item.categoria ||
    item.tipo ||
    "Evento"
  ).trim();
}

function urlEvento(item) {
  if (!item?.id) {
    return "./eventos.html";
  }

  return `./eventos.html?id=${encodeURIComponent(item.id)}`;
}

function agendaEvento(item) {
  const data = dataEventoFormatada(item);

  return `
    <a href="${urlEvento(item)}" class="agenda-item">
      <div class="agenda-data" aria-hidden="true">
        <strong>${data.dia}</strong>
        <span>${data.mes}</span>
      </div>

      <div class="agenda-info">
        <h3>${tituloEvento(item)}</h3>
        <p>${localEvento(item)}</p>
        <p>${categoriaEvento(item)}</p>
      </div>
    </a>
  `;
}

function renderizarAgendaEventos(grid, lista) {
  if (!grid) return;

  const listaLimitada = limitarLista(
    [...lista].sort(ordenarEventosAgenda),
    4,
    4
  );

  controlarSecao("gridEventosCentroOeste", listaLimitada);

  grid.className = "agenda-eventos-lista";

  if (!listaLimitada.length) {
    grid.innerHTML = `
      <div class="empty">
        Nenhum evento encontrado.
      </div>
    `;

    return;
  }

  grid.innerHTML = listaLimitada
    .map((item) => agendaEvento(item))
    .join("");
}

/* ===========================================================
   09. BUSCA GLOBAL
=========================================================== */

function executarBuscaGlobal() {
  const termo = String(buscaInput?.value || "").trim();
  const regiao = String(filtroRegiao?.value || "").trim();
  const tipo = String(filtroTipo?.value || "").trim();

  const params = new URLSearchParams();

  if (termo) params.set("q", termo);
  if (regiao) params.set("regiao", regiao);
  if (tipo) params.set("tipo", tipo);

  const queryString = params.toString();

  window.location.href = queryString
    ? `./anuncios.html?${queryString}`
    : "./anuncios.html";
}

/* ===========================================================
   10. RENDERIZAÇÃO PRINCIPAL
=========================================================== */

function renderizarTudo() {
  const anunciosFiltrados = filtrar(anuncios).sort(ordenarPorData);

  const destaques = anunciosFiltrados
    .filter(anuncioEmDestaque)
    .sort(ordenarDestaques);

  const eventosFiltrados = filtrarEventos(eventos);

  controlarSecao("gridEscolhaVolante", destaques);
  renderizarEscolhaVolante(grids.escolhaVolante, destaques);

  renderizarSecao(
    "gridRecentes",
    grids.recentes,
    anunciosFiltrados,
    cardAnuncio,
    "Nenhum anúncio encontrado.",
    8,
    8
  );

  renderizarSecao(
    "gridCentroOeste",
    grids.centroOeste,
    filtrarRegiao(anunciosFiltrados, REGIOES.centroOeste),
    cardAnuncio,
    "Nenhum anúncio encontrado.",
    8,
    8
  );

  renderizarSecao(
    "gridSudeste",
    grids.sudeste,
    filtrarRegiao(anunciosFiltrados, REGIOES.sudeste),
    cardAnuncio,
    "Nenhum anúncio encontrado.",
    8,
    8
  );

  renderizarSecao(
    "gridSul",
    grids.sul,
    filtrarRegiao(anunciosFiltrados, REGIOES.sul),
    cardAnuncio,
    "Nenhum anúncio encontrado.",
    8,
    8
  );

  renderizarSecao(
    "gridNordeste",
    grids.nordeste,
    filtrarRegiao(anunciosFiltrados, REGIOES.nordeste),
    cardAnuncio,
    "Nenhum anúncio encontrado.",
    8,
    8
  );

  renderizarSecao(
    "gridNorte",
    grids.norte,
    filtrarRegiao(anunciosFiltrados, REGIOES.norte),
    cardAnuncio,
    "Nenhum anúncio encontrado.",
    8,
    8
  );

  renderizarAgendaEventos(
    grids.eventosCentroOeste,
    eventosFiltrados
  );

  controlarSecao("gridEventosSudeste", []);
  controlarSecao("gridEventosSul", []);
  controlarSecao("gridEventosNordeste", []);
  controlarSecao("gridEventosNorte", []);
}

/* ===========================================================
   11. CARREGAMENTO FIRESTORE
=========================================================== */

async function carregarDados() {
  try {
    const [snapAnuncios, snapEventos] = await Promise.all([
      getDocs(collection(db, "anuncios")),
      getDocs(collection(db, "eventos"))
    ]);

    anuncios = snapAnuncios.docs
      .map((doc) => normalizarAnuncio({ id: doc.id, ...doc.data() }))
      .filter(statusAtivo);

    eventos = snapEventos.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(statusAtivo);

    renderizarTudo();
  } catch (error) {
    console.error("Erro ao carregar home:", error);

    Object.values(grids).forEach((grid) => {
      if (grid) {
        grid.innerHTML = `
          <div class="empty">
            Não foi possível carregar os dados agora.
          </div>
        `;
      }
    });
  }
}

carregarDados();
