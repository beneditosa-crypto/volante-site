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
  cardEvento,
  renderizarGrid
} from "./components.js";

const buscaInput = document.getElementById("busca");
const gridEventos = document.getElementById("gridEventos");
const btnCarregarMais = document.getElementById("btnCarregarMais");
const tituloPagina = document.getElementById("tituloPagina");
const subtituloPagina = document.getElementById("subtituloPagina");
const botoesRegiao = document.querySelectorAll(".filtro-regiao");

const ITENS_POR_PAGINA = 24;

let eventos = [];
let paginaAtual = 1;
let regiaoAtual = "";

const REGIOES = {
  centroOeste: ["GO", "DF", "MT", "MS"],
  sudeste: ["SP", "RJ", "MG", "ES"],
  sul: ["PR", "SC", "RS"],
  nordeste: ["BA", "PE", "CE", "RN", "PB", "AL", "SE", "PI", "MA"],
  norte: ["AM", "PA", "RO", "RR", "TO", "AC", "AP"]
};

const NOMES_REGIOES = {
  centroOeste: "Centro-Oeste",
  sudeste: "Sudeste",
  sul: "Sul",
  nordeste: "Nordeste",
  norte: "Norte"
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

inicializar();

function inicializar() {
  const params = new URLSearchParams(window.location.search);
  const regiaoUrl = params.get("regiao") || "";

  if (REGIOES[regiaoUrl]) {
    regiaoAtual = regiaoUrl;
  }

  atualizarFiltroAtivo();

  if (buscaInput) {
    buscaInput.addEventListener("input", () => {
      paginaAtual = 1;
      renderizarTudo();
    });
  }

  botoesRegiao.forEach((botao) => {
    botao.addEventListener("click", () => {
      regiaoAtual = botao.dataset.regiao || "";
      paginaAtual = 1;

      const url = new URL(window.location.href);

      if (regiaoAtual) {
        url.searchParams.set("regiao", regiaoAtual);
      } else {
        url.searchParams.delete("regiao");
      }

      window.history.replaceState({}, "", url.toString());

      atualizarFiltroAtivo();
      atualizarTitulos();
      renderizarTudo();
    });
  });

  if (btnCarregarMais) {
    btnCarregarMais.addEventListener("click", () => {
      paginaAtual += 1;
      renderizarTudo();
    });
  }

  atualizarTitulos();
  carregarDados();
}

function statusAtivo(item) {
  return String(item.status || "")
    .trim()
    .toUpperCase() === "ATIVO";
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

function filtrarPorRegiao(lista) {
  if (!regiaoAtual || !REGIOES[regiaoAtual]) {
    return lista;
  }

  return lista.filter((item) =>
    REGIOES[regiaoAtual].includes(obterUF(item))
  );
}

function filtrarPorBusca(lista) {
  const termo = normalizar(buscaInput?.value || "");
  const somenteComImagem = lista.filter((item) => !!getImagem(item));

  if (!termo) return somenteComImagem;

  return somenteComImagem.filter((item) => {
    const texto = normalizar([
      item.titulo,
      item.nome,
      item.descricao,
      item.cidade,
      item.estado,
      item.uf,
      item.data
    ].join(" "));

    return texto.includes(termo);
  });
}

function obterListaFiltrada() {
  return filtrarPorRegiao(
    filtrarPorBusca(eventos)
  ).sort((a, b) => getDataMs(b) - getDataMs(a));
}

function atualizarFiltroAtivo() {
  botoesRegiao.forEach((botao) => {
    const valor = botao.dataset.regiao || "";

    botao.classList.toggle(
      "ativo",
      valor === regiaoAtual
    );
  });
}

function atualizarTitulos() {
  if (!tituloPagina || !subtituloPagina) return;

  if (regiaoAtual && NOMES_REGIOES[regiaoAtual]) {
    tituloPagina.textContent = `Eventos no ${NOMES_REGIOES[regiaoAtual]}`;
    subtituloPagina.textContent =
      `Explore encontros automotivos e experiências da região ${NOMES_REGIOES[regiaoAtual]}.`;
    return;
  }

  tituloPagina.textContent = "Eventos";
  subtituloPagina.textContent =
    "Explore encontros automotivos, eventos clássicos e experiências do universo Volante.";
}

function renderizarTudo() {
  const lista = obterListaFiltrada();
  const limite = paginaAtual * ITENS_POR_PAGINA;
  const visiveis = lista.slice(0, limite);

  renderizarGrid(
    gridEventos,
    visiveis,
    cardEvento,
    "Nenhum evento encontrado."
  );

  if (btnCarregarMais) {
    btnCarregarMais.style.display =
      lista.length > visiveis.length ? "inline-flex" : "none";
  }
}

async function carregarDados() {
  try {
    if (gridEventos) {
      gridEventos.innerHTML =
        `<div class="empty">Carregando eventos...</div>`;
    }

    const snapEventos = await getDocs(collection(db, "eventos"));

    eventos = snapEventos.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(statusAtivo);

    renderizarTudo();
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);

    if (gridEventos) {
      gridEventos.innerHTML =
        `<div class="empty">Não foi possível carregar os eventos agora.</div>`;
    }

    if (btnCarregarMais) {
      btnCarregarMais.style.display = "none";
    }
  }
}
