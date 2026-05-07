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

const buscaInput =
  document.getElementById("busca");

const grids = {
  destaques: document.getElementById("gridDestaques"),
  recentes: document.getElementById("gridRecentes"),
  favoritos: document.getElementById("gridFavoritos"),
  goias: document.getElementById("gridGoias"),
  df: document.getElementById("gridDF"),
  eventos: document.getElementById("gridEventos"),
  eventosFavoritos: document.getElementById("gridEventosFavoritos")
};

let anuncios = [];
let eventos = [];

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

function renderizarTudo() {
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
    anunciosFiltrados.slice(3, 15),
    cardAnuncio,
    "Nenhum favorito encontrado."
  );

  renderizarGrid(
    grids.goias,
    anunciosFiltrados.filter(
      (item) =>
        item.estado === "GO"
    ),
    cardAnuncio,
    "Nenhum anúncio encontrado."
  );

  renderizarGrid(
    grids.df,
    anunciosFiltrados.filter(
      (item) =>
        item.estado === "DF"
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
    eventosFiltrados.slice(0, 8),
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
