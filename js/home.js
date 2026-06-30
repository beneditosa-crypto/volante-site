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
  cardEvento,
  renderizarGrid
} from "./components.js";

const buscaInput = document.getElementById("busca");

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

mediaMobile.addEventListener("change", () => {
  renderizarTudo();
});

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

if (buscaInput) {
  buscaInput.addEventListener("input", renderizarTudo);
}

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

function ordenarDestaques(a, b) {
  const destaqueA = anuncioEmDestaque(a) ? 1 : 0;
  const destaqueB = anuncioEmDestaque(b) ? 1 : 0;

  if (destaqueA !== destaqueB) {
    return destaqueB - destaqueA;
  }

  return ordenarPorData(a, b);
}

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

function controlarSecao(idGrid, lista) {
  const grid = document.getElementById(idGrid);
  if (!grid) return;

  const secao = grid.closest("section");
  if (!secao) return;

  secao.style.display = lista.length ? "block" : "none";
}

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

  const mobile = mediaMobile.matches;
  const selecionados = lista.slice(0, mobile ? 6 : 3);

  grid.classList.add(`mosaico-qtd-${selecionados.length}`);

  if (mobile) {
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
  mensagemVazia
) {
  controlarSecao(idGrid, lista);
  renderizarCarrossel(grid, lista, renderCard, mensagemVazia);
}

function renderizarTudo() {
  const anunciosFiltrados = filtrar(anuncios).sort(ordenarPorData);

  const destaques = anunciosFiltrados
    .filter(anuncioEmDestaque)
    .sort(ordenarDestaques);

  const eventosFiltrados = filtrar(eventos).sort(ordenarPorData);

  controlarSecao("gridEscolhaVolante", destaques);
  renderizarEscolhaVolante(grids.escolhaVolante, destaques);

  renderizarSecao(
    "gridRecentes",
    grids.recentes,
    anunciosFiltrados,
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarSecao(
    "gridCentroOeste",
    grids.centroOeste,
    filtrarRegiao(anunciosFiltrados, REGIOES.centroOeste),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarSecao(
    "gridSudeste",
    grids.sudeste,
    filtrarRegiao(anunciosFiltrados, REGIOES.sudeste),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarSecao(
    "gridSul",
    grids.sul,
    filtrarRegiao(anunciosFiltrados, REGIOES.sul),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarSecao(
    "gridNordeste",
    grids.nordeste,
    filtrarRegiao(anunciosFiltrados, REGIOES.nordeste),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarSecao(
    "gridNorte",
    grids.norte,
    filtrarRegiao(anunciosFiltrados, REGIOES.norte),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarSecao(
    "gridEventosCentroOeste",
    grids.eventosCentroOeste,
    filtrarRegiao(eventosFiltrados, REGIOES.centroOeste),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarSecao(
    "gridEventosSudeste",
    grids.eventosSudeste,
    filtrarRegiao(eventosFiltrados, REGIOES.sudeste),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarSecao(
    "gridEventosSul",
    grids.eventosSul,
    filtrarRegiao(eventosFiltrados, REGIOES.sul),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarSecao(
    "gridEventosNordeste",
    grids.eventosNordeste,
    filtrarRegiao(eventosFiltrados, REGIOES.nordeste),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarSecao(
    "gridEventosNorte",
    grids.eventosNorte,
    filtrarRegiao(eventosFiltrados, REGIOES.norte),
    cardEvento,
    "Nenhum evento encontrado."
  );
}

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
