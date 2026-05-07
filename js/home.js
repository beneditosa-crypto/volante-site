import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

import {
  normalizar,
  getDataMs,
  getImagem,
  obterFavoritos
} from "./shared.js";

import {
  cardAnuncio,
  cardEvento,
  renderizarGrid
} from "./components.js";

const buscaInput =
  document.getElementById("busca");

const grids = {
  destaques: document.getElementById("gridDestaques"),
  recentes: document.getElementById("gridRecentes"),
  favoritos: document.getElementById("gridFavoritos"),

  centroOeste: document.getElementById("gridCentroOeste"),
  sudeste: document.getElementById("gridSudeste"),
  sul: document.getElementById("gridSul"),
  nordeste: document.getElementById("gridNordeste"),
  norte: document.getElementById("gridNorte"),

  eventos: document.getElementById("gridEventos"),
  eventosFavoritos: document.getElementById("gridEventosFavoritos"),

  eventosCentroOeste: document.getElementById("gridEventosCentroOeste"),
  eventosSudeste: document.getElementById("gridEventosSudeste"),
  eventosSul: document.getElementById("gridEventosSul"),
  eventosNordeste: document.getElementById("gridEventosNordeste"),
  eventosNorte: document.getElementById("gridEventosNorte")
};

let anuncios = [];
let eventos = [];

const REGIOES = {
  centroOeste: ["GO", "DF", "MT", "MS"],
  sudeste: ["SP", "RJ", "MG", "ES"],
  sul: ["PR", "SC", "RS"],
  nordeste: ["BA", "PE", "CE", "RN", "PB", "AL", "SE", "PI", "MA"],
  norte: ["AM", "PA", "RO", "RR", "TO", "AC", "AP"]
};

buscaInput.addEventListener(
  "input",
  renderizarTudo
);

function filtrar(lista) {
  const termo =
    normalizar(buscaInput.value);

  const somenteComImagem =
    lista.filter(
      (item) => !!getImagem(item)
    );

  if (!termo) {
    return somenteComImagem;
  }

  return somenteComImagem.filter(
    (item) => {
      const texto = normalizar(
        [
          item.titulo,
          item.nome,
          item.marca,
          item.modelo,
          item.descricao,
          item.cidade,
          item.estado,
          item.uf,
          item.preco
        ].join(" ")
      );

      return texto.includes(termo);
    }
  );
}

function obterUF(item) {
  const valor =
    item.uf ||
    item.estado ||
    "";

  const texto =
    String(valor)
      .trim()
      .toUpperCase();

  if (texto.includes("GOI")) return "GO";
  if (texto.includes("DISTRITO")) return "DF";
  if (texto.includes("BRASILIA")) return "DF";
  if (texto.includes("SÃO PAULO")) return "SP";
  if (texto.includes("SAO PAULO")) return "SP";
  if (texto.includes("RIO DE JANEIRO")) return "RJ";
  if (texto.includes("MINAS")) return "MG";
  if (texto.includes("ESPIRITO")) return "ES";
  if (texto.includes("PARANA")) return "PR";
  if (texto.includes("SANTA CATARINA")) return "SC";
  if (texto.includes("RIO GRANDE DO SUL")) return "RS";

  return texto;
}

function filtrarRegiao(lista, estados) {
  return lista.filter((item) => {
    const uf =
      obterUF(item);

    return estados.includes(uf);
  });
}

function controlarSecao(idGrid, lista) {
  const grid =
    document.getElementById(idGrid);

  if (!grid) return;

  const secao =
    grid.closest("section");

  if (!secao) return;

  secao.style.display =
    lista.length
      ? "block"
      : "none";
}

function renderizarTudo() {
  const favoritosIds =
    obterFavoritos();

  const anunciosFiltrados =
    filtrar(anuncios)
      .sort(
        (a, b) =>
          getDataMs(b) -
          getDataMs(a)
      );

  const eventosFiltrados =
    filtrar(eventos)
      .sort(
        (a, b) =>
          getDataMs(b) -
          getDataMs(a)
      );

  const favoritos =
    anunciosFiltrados.filter(
      (item) =>
        favoritosIds.includes(item.id)
    );

  const eventosFavoritos =
    eventosFiltrados.filter(
      (item) =>
        favoritosIds.includes(item.id)
    );

  const anunciosCentroOeste =
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.centroOeste
    );

  const anunciosSudeste =
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.sudeste
    );

  const anunciosSul =
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.sul
    );

  const anunciosNordeste =
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.nordeste
    );

  const anunciosNorte =
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.norte
    );

  const eventosCentroOeste =
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.centroOeste
    );

  const eventosSudeste =
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.sudeste
    );

  const eventosSul =
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.sul
    );

  const eventosNordeste =
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.nordeste
    );

  const eventosNorte =
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.norte
    );

  controlarSecao(
    "gridFavoritos",
    favoritos
  );

  controlarSecao(
    "gridCentroOeste",
    anunciosCentroOeste
  );

  controlarSecao(
    "gridSudeste",
    anunciosSudeste
  );

  controlarSecao(
    "gridSul",
    anunciosSul
  );

  controlarSecao(
    "gridNordeste",
    anunciosNordeste
  );

  controlarSecao(
    "gridNorte",
    anunciosNorte
  );

  controlarSecao(
    "gridEventosFavoritos",
    eventosFavoritos
  );

  controlarSecao(
    "gridEventosCentroOeste",
    eventosCentroOeste
  );

  controlarSecao(
    "gridEventosSudeste",
    eventosSudeste
  );

  controlarSecao(
    "gridEventosSul",
    eventosSul
  );

  controlarSecao(
    "gridEventosNordeste",
    eventosNordeste
  );

  controlarSecao(
    "gridEventosNorte",
    eventosNorte
  );

  renderizarGrid(
    grids.destaques,
    anunciosFiltrados.slice(0, 12),
    cardAnuncio,
    "Nenhum destaque encontrado."
  );

  renderizarGrid(
    grids.recentes,
    anunciosFiltrados.slice(0, 18),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.favoritos,
    favoritos,
    cardAnuncio,
    "Nenhum favorito salvo."
  );

  renderizarGrid(
    grids.centroOeste,
    anunciosCentroOeste,
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.sudeste,
    anunciosSudeste,
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.sul,
    anunciosSul,
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.nordeste,
    anunciosNordeste,
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.norte,
    anunciosNorte,
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.eventos,
    eventosFiltrados,
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosFavoritos,
    eventosFavoritos,
    cardEvento,
    "Nenhum evento favorito."
  );

  renderizarGrid(
    grids.eventosCentroOeste,
    eventosCentroOeste,
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosSudeste,
    eventosSudeste,
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosSul,
    eventosSul,
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosNordeste,
    eventosNordeste,
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosNorte,
    eventosNorte,
    cardEvento,
    "Nenhum evento encontrado."
  );
}

async function carregarDados() {
  const qAnuncios =
    collection(db, "anuncios");

  const qEventos =
    collection(db, "eventos");

  const [
    snapAnuncios,
    snapEventos
  ] = await Promise.all([
    getDocs(qAnuncios),
    getDocs(qEventos)
  ]);

  anuncios =
    snapAnuncios.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(
        (item) =>
          item.status === "ATIVO"
      );

  eventos =
    snapEventos.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(
        (item) =>
          item.status === "ATIVO"
      );

  renderizarTudo();
}

carregarDados();
