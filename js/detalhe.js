import { db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  baixarApp,
  escapeHtml,
  formatarPreco,
  getFotos,
  textoLocal
} from "./shared.js";

window.baixarApp = baixarApp;

const conteudo = document.getElementById("conteudo");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const tipo = (params.get("tipo") || "anuncio").toLowerCase();

let fotos = [];
let fotoAtual = 0;

function atualizarFoto() {
  const fotoPrincipal = document.getElementById("fotoPrincipal");

  if (!fotoPrincipal) return;

  fotoPrincipal.src = fotos[fotoAtual];

  document.querySelectorAll(".miniatura").forEach((item, index) => {
    item.classList.toggle("ativa", index === fotoAtual);
  });
}

function iniciarGaleria() {
  const anterior = document.getElementById("fotoAnterior");
  const proxima = document.getElementById("fotoProxima");

  anterior?.addEventListener("click", () => {
    fotoAtual = fotoAtual === 0 ? fotos.length - 1 : fotoAtual - 1;
    atualizarFoto();
  });

  proxima?.addEventListener("click", () => {
    fotoAtual = fotoAtual === fotos.length - 1 ? 0 : fotoAtual + 1;
    atualizarFoto();
  });

  document.querySelectorAll(".miniatura").forEach((item) => {
    item.addEventListener("click", () => {
      fotoAtual = Number(item.dataset.index);
      atualizarFoto();
    });
  });
}

function renderizar(item, colecaoUsada) {
  fotos = getFotos(item);

  const titulo =
    item.titulo ||
    item.nome ||
    `${item.marca || ""} ${item.modelo || ""}`.trim() ||
    "Volante";

  const descricao =
    item.descricao ||
    "Sem descrição.";

  const preco =
    formatarPreco(item.preco);

  const local =
    textoLocal(item);

  const ehEvento =
    colecaoUsada === "eventos";

  document.title = `${titulo} | Volante App`;

  conteudo.innerHTML = `
    <section class="detalhe">

      <div class="galeria">

        <div class="foto-principal-wrap">

          ${
            fotos.length > 1
              ? `<button class="seta-foto seta-foto-esquerda" id="fotoAnterior">‹</button>`
              : ""
          }

          <img
            id="fotoPrincipal"
            class="foto-principal"
            src="${fotos[0]}"
            alt="${escapeHtml(titulo)}"
          />

          ${
            fotos.length > 1
              ? `<button class="seta-foto seta-foto-direita" id="fotoProxima">›</button>`
              : ""
          }

          <div class="tipo-badge">
            ${ehEvento ? "EVENTO" : "ANÚNCIO"}
          </div>

        </div>

        ${
          fotos.length > 1
            ? `
              <div class="miniaturas">
                ${fotos.map((foto, index) => `
                  <img
                    class="miniatura ${index === 0 ? "ativa" : ""}"
                    src="${foto}"
                    data-index="${index}"
                    alt=""
                  />
                `).join("")}
              </div>
            `
            : ""
        }

      </div>

      <div class="painel">

        <h1 class="titulo">
          ${escapeHtml(titulo)}
        </h1>

        <div class="meta">
          ${escapeHtml(local)}
        </div>

        ${
          preco && !ehEvento
            ? `<div class="preco">${escapeHtml(preco)}</div>`
            : ""
        }

        <div class="descricao">
          <h3>Descrição</h3>

          <p>
            ${escapeHtml(descricao)}
          </p>
        </div>

        <div class="cta-app detalhe-lojas">

          <div class="detalhe-lojas-info">

            <span class="app-badge">
              CONTATO PELO APP
            </span>

            <h3>
              Converse com o anunciante pelo aplicativo
            </h3>

            <p>
              Para anunciar veículos, publicar eventos e entrar em contato,
              baixe o app do Volante.
            </p>

          </div>

          <div class="app-store-box">

            <a
              class="app-store-btn"
              href="#"
              onclick="baixarApp(); return false;"
            >
              <img
                src="./assets/apple-store.png"
                alt="App Store"
                class="store-logo"
              />

              <div class="store-textos">
                <small>Disponível na</small>
                <strong>App Store</strong>
              </div>
            </a>

            <a
              class="app-store-btn"
              href="#"
              onclick="baixarApp(); return false;"
            >
              <img
                src="./assets/google-play.png"
                alt="Google Play"
                class="store-logo"
              />

              <div class="store-textos">
                <small>Disponível no</small>
                <strong>Google Play</strong>
              </div>
            </a>

          </div>

        </div>

        <button
          class="btn-share-premium"
          onclick="compartilharDetalhe()"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <path d="M8.59 13.51l6.83 3.98"></path>
            <path d="M15.41 6.51L8.59 10.49"></path>
          </svg>

          Compartilhe
        </button>

      </div>

    </section>
  `;

  iniciarGaleria();
}

window.compartilharDetalhe = async function () {
  const tituloPagina =
    document.querySelector(".titulo")?.textContent?.trim() || "Volante";

  const slug =
    tituloPagina
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const shareUrl =
    tipo === "evento"
      ? `https://volante.app.br/evento/${slug}-${id}`
      : `https://volante.app.br/anuncio/${slug}-${id}`;

  if (navigator.share) {
    try {
    await navigator.share({
        title: tituloPagina,
        url: shareUrl
      });
    } catch {}

    return;
  }

  window.open(
    `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    "_blank"
  );
};

async function carregar() {
  if (!conteudo) return;

  if (!id) {
    conteudo.innerHTML = `
      <div class="empty">
        ID inválido.
      </div>
    `;

    return;
  }

  try {
    const colecoes =
      tipo === "evento"
        ? ["eventos", "anuncios"]
        : ["anuncios", "eventos"];

    let snapshotEncontrado = null;
    let colecaoUsada = "";

    for (const colecao of colecoes) {
      const referencia = doc(db, colecao, id);
      const snapshot = await getDoc(referencia);

      if (snapshot.exists()) {
        snapshotEncontrado = snapshot;
        colecaoUsada = colecao;
        break;
      }
    }

    if (!snapshotEncontrado) {
      conteudo.innerHTML = `
        <div class="empty">
          Conteúdo não encontrado.
        </div>
      `;

      return;
    }

    renderizar(
      {
        id: snapshotEncontrado.id,
        ...snapshotEncontrado.data()
      },
      colecaoUsada
    );
  } catch (erro) {
    console.error("Erro detalhe:", erro);

    conteudo.innerHTML = `
      <div class="empty">
        Erro ao carregar detalhe.
      </div>
    `;
  }
}

carregar();
