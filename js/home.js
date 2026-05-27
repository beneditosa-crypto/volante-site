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

const REGIOES = {
  centroOeste: ["GO", "DF", "MT", "MS"],
  sudeste: ["SP", "RJ", "MG", "ES"],
  sul: ["PR", "SC", "RS"],
  nordeste: ["BA", "PE", "CE", "RN", "PB", "AL", "SE", "PI", "MA"],
  norte: ["AM", "PA", "RO", "RR", "TO", "AC", "AP"]
};

if (buscaInput) {
  buscaInput.addEventListener("input", renderizarTudo);
}

function statusAtivo(item) {
  return String(item.status || "")
    .trim()
    .toUpperCase() === "ATIVO";
}

function filtrar(lista) {
  const termo = normalizar(buscaInput?.value || "");
  const somenteComImagem = lista.filter((item) => !!getImagem(item));

  if (!termo) return somenteComImagem;

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

function obterUF(item) {
  const texto = normalizar([
    item.uf,
    item.estado,
    item.local,
    item.endereco,
    item.cidade
  ].filter(Boolean).join(" ")).toUpperCase();

  const estados = {
    AC: ["AC", "ACRE"],
    AL: ["AL", "ALAGOAS"],
    AP: ["AP", "AMAPA"],
    AM: ["AM", "AMAZONAS"],
    BA: ["BA", "BAHIA"],
    CE: ["CE", "CEARA"],
    DF: ["DF", "DISTRITO FEDERAL", "BRASILIA"],
    ES: ["ES", "ESPIRITO SANTO"],
    GO: ["GO", "GOIAS"],
    MA: ["MA", "MARANHAO"],
    MT: ["MT", "MATO GROSSO"],
    MS: ["MS", "MATO GROSSO DO SUL"],
    MG: ["MG", "MINAS GERAIS", "MINAS"],
    PA: ["PA", "PARA"],
    PB: ["PB", "PARAIBA"],
    PR: ["PR", "PARANA"],
    PE: ["PE", "PERNAMBUCO"],
    PI: ["PI", "PIAUI"],
    RJ: ["RJ", "RIO DE JANEIRO"],
    RN: ["RN", "RIO GRANDE DO NORTE"],
    RS: ["RS", "RIO GRANDE DO SUL"],
    RO: ["RO", "RONDONIA"],
    RR: ["RR", "RORAIMA"],
    SC: ["SC", "SANTA CATARINA"],
    SP: ["SP", "SAO PAULO"],
    SE: ["SE", "SERGIPE"],
    TO: ["TO", "TOCANTINS"]
  };

  for (const uf in estados) {
    if (estados[uf].some((valor) => texto.includes(valor))) return uf;
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

function renderizarTudo() {
  const anunciosFiltrados = filtrar(anuncios).sort((a, b) => getDataMs(b) - getDataMs(a));
  const eventosFiltrados = filtrar(eventos).sort((a, b) => getDataMs(b) - getDataMs(a));

  const anunciosCentroOeste = filtrarRegiao(anunciosFiltrados, REGIOES.centroOeste);
  const anunciosSudeste = filtrarRegiao(anunciosFiltrados, REGIOES.sudeste);
  const anunciosSul = filtrarRegiao(anunciosFiltrados, REGIOES.sul);
  const anunciosNordeste = filtrarRegiao(anunciosFiltrados, REGIOES.nordeste);
  const anunciosNorte = filtrarRegiao(anunciosFiltrados, REGIOES.norte);

  const eventosCentroOeste = filtrarRegiao(eventosFiltrados, REGIOES.centroOeste);
  const eventosSudeste = filtrarRegiao(eventosFiltrados, REGIOES.sudeste);
  const eventosSul = filtrarRegiao(eventosFiltrados, REGIOES.sul);
  const eventosNordeste = filtrarRegiao(eventosFiltrados, REGIOES.nordeste);
  const eventosNorte = filtrarRegiao(eventosFiltrados, REGIOES.norte);

  controlarSecao("gridRecentes", anunciosFiltrados);

  controlarSecao("gridCentroOeste", anunciosCentroOeste);
  controlarSecao("gridSudeste", anunciosSudeste);
  controlarSecao("gridSul", anunciosSul);
  controlarSecao("gridNordeste", anunciosNordeste);
  controlarSecao("gridNorte", anunciosNorte);

  controlarSecao("gridEventosCentroOeste", eventosCentroOeste);
  controlarSecao("gridEventosSudeste", eventosSudeste);
  controlarSecao("gridEventosSul", eventosSul);
  controlarSecao("gridEventosNordeste", eventosNordeste);
  controlarSecao("gridEventosNorte", eventosNorte);

  renderizarGrid(grids.recentes, anunciosFiltrados.slice(0, 18), cardAnuncio, "Nenhum anúncio encontrado.");

  renderizarGrid(grids.centroOeste, anunciosCentroOeste, cardAnuncio, "Nenhum anúncio encontrado.");
  renderizarGrid(grids.sudeste, anunciosSudeste, cardAnuncio, "Nenhum anúncio encontrado.");
  renderizarGrid(grids.sul, anunciosSul, cardAnuncio, "Nenhum anúncio encontrado.");
  renderizarGrid(grids.nordeste, anunciosNordeste, cardAnuncio, "Nenhum anúncio encontrado.");
  renderizarGrid(grids.norte, anunciosNorte, cardAnuncio, "Nenhum anúncio encontrado.");

  renderizarGrid(grids.eventosCentroOeste, eventosCentroOeste, cardEvento, "Nenhum evento encontrado.");
  renderizarGrid(grids.eventosSudeste, eventosSudeste, cardEvento, "Nenhum evento encontrado.");
  renderizarGrid(grids.eventosSul, eventosSul, cardEvento, "Nenhum evento encontrado.");
  renderizarGrid(grids.eventosNordeste, eventosNordeste, cardEvento, "Nenhum evento encontrado.");
  renderizarGrid(grids.eventosNorte, eventosNorte, cardEvento, "Nenhum evento encontrado.");
}

async function carregarDados() {
  try {
    const [snapAnuncios, snapEventos] = await Promise.all([
      getDocs(collection(db, "anuncios")),
      getDocs(collection(db, "eventos"))
    ]);

    anuncios = snapAnuncios.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(statusAtivo);

    eventos = snapEventos.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(statusAtivo);

    renderizarTudo();
  } catch (error) {
    console.error("Erro ao carregar home:", error);

    Object.values(grids).forEach((grid) => {
      if (grid) {
        grid.innerHTML = `<div class="empty">Não foi possível carregar os dados agora.</div>`;
      }
    });
  }
}

carregarDados();
