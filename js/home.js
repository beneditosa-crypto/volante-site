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

const gridDestaques =
  document.getElementById("gridDestaques");

const gridRecentes =
  document.getElementById("gridRecentes");

const gridEventos =
  document.getElementById("gridEventos");

const contadorDestaques =
  document.getElementById("contadorDestaques");

const contadorRecentes =
  document.getElementById("contadorRecentes");

const contadorEventos =
  document.getElementById("contadorEventos");

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

  const destaques =
    anunciosFiltrados.slice(0, 8);

  const recentes =
    anunciosFiltrados.slice(0, 12);

  const eventosTela =
    eventosFiltrados.slice(0, 12);

  contadorDestaques.textContent =
    `${destaques.length} exibidos`;

  contadorRecentes.textContent =
    `${recentes.length} exibidos`;

  contadorEventos.textContent =
    `${eventosTela.length} exibidos`;

  renderizarGrid(
    gridDestaques,
    destaques,
    cardAnuncio,
    "Nenhum destaque ativo encontrado."
  );

  renderizarGrid(
    gridRecentes,
    recentes,
    cardAnuncio,
    "Nenhum anúncio ativo encontrado."
  );

  renderizarGrid(
    gridEventos,
    eventosTela,
    cardEvento,
    "Nenhum evento ativo encontrado."
  );
}

async function carregarDados() {
  gridDestaques.innerHTML =
    `<div class="loading">Carregando destaques...</div>`;

  gridRecentes.innerHTML =
    `<div class="loading">Carregando anúncios...</div>`;

  gridEventos.innerHTML =
    `<div class="loading">Carregando eventos...</div>`;

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

carregarDados().catch((error) => {
  console.error(error);

  gridDestaques.innerHTML =
    `<div class="erro">Erro ao carregar destaques.</div>`;

  gridRecentes.innerHTML =
    `<div class="erro">Erro ao carregar anúncios.</div>`;

  gridEventos.innerHTML =
    `<div class="erro">Erro ao carregar eventos.</div>`;
});
