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

function ordenarAnuncios(a, b) {
  const destaqueA = anuncioEmDestaque(a) ? 1 : 0;
  const destaqueB = anuncioEmDestaque(b) ? 1 : 0;

  if (destaqueA !== destaqueB) {
    return destaqueB - destaqueA;
  }

  return getDataMs(b) - getDataMs(a);
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

function renderizarTudo() {
  const anunciosFiltrados = filtrar(anuncios).sort(ordenarAnuncios);
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
        grid.innerHTML = `<div class="empty">Não foi possível carregar os dados agora.</div>`;
      }
    });
  }
}

carregarDados();
