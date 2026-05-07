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
  return (
    item.uf ||
    item.estado ||
    ""
  )
    .toString()
    .trim()
    .toUpperCase();
}

function filtrarRegiao(lista, estados) {
  return lista.filter((item) => {
    const uf =
      obterUF(item);

    return estados.includes(uf);
  });
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
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.centroOeste
    ),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.sudeste,
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.sudeste
    ),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.sul,
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.sul
    ),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.nordeste,
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.nordeste
    ),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.norte,
    filtrarRegiao(
      anunciosFiltrados,
      REGIOES.norte
    ),
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
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.centroOeste
    ),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosSudeste,
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.sudeste
    ),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosSul,
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.sul
    ),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosNordeste,
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.nordeste
    ),
    cardEvento,
    "Nenhum evento encontrado."
  );

  renderizarGrid(
    grids.eventosNorte,
    filtrarRegiao(
      eventosFiltrados,
      REGIOES.norte
    ),
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
