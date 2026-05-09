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

const tipo =
  (params.get("tipo") || "anuncio")
    .toLowerCase();

let fotos = [];
let fotoAtual = 0;

async function compartilharConteudo(titulo) {
  const shareData = {
    title: titulo,
    text: "Veja este conteúdo no Volante App",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);

    alert("Link copiado.");
  } catch (erro) {
    console.error("Erro compartilhar:", erro);
  }
}

window.compartilharConteudo = compartilharConteudo;

function atualizarMetaTag(property, content) {
  if (!content) return;

  let element =
    document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`);

  if (!element) {
    element = document.createElement("meta");

    if (property.startsWith("og:")) {
      element.setAttribute("property", property);
    } else {
      element.setAttribute("name", property);
    }

    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function atualizarOpenGraph({
  titulo,
  descricao,
  imagem,
  url
}) {
  document.title = `${titulo} | Volante App`;

  atualizarMetaTag("description", descricao);
  atualizarMetaTag("og:title", titulo);
  atualizarMetaTag("og:description", descricao);
  atualizarMetaTag("og:image", imagem);
  atualizarMetaTag("og:url", url);

  atualizarMetaTag("twitter:card", "summary_large_image");
  atualizarMetaTag("twitter:title", titulo);
  atualizarMetaTag("twitter:description", descricao);
  atualizarMetaTag("twitter:image", imagem);

  let canonical =
    document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
}

function atualizarFoto() {
  const fotoPrincipal =
    document.getElementById("fotoPrincipal");

  if (!fotoPrincipal) return;

  fotoPrincipal.src = fotos[fotoAtual];

  document
    .querySelectorAll(".miniatura")
    .forEach((item, index) => {
      item.classList.toggle(
        "ativa",
        index === fotoAtual
      );
    });
}

function iniciarGaleria() {
  const anterior =
    document.getElementById("fotoAnterior");

  const proxima =
    document.getElementById("fotoProxima");

  anterior?.addEventListener("click", () => {
    fotoAtual =
      fotoAtual === 0
        ? fotos.length - 1
        : fotoAtual - 1;

    atualizarFoto();
  });

  proxima?.addEventListener("click", () => {
    fotoAtual =
      fotoAtual === fotos.length - 1
        ? 0
        : fotoAtual + 1;

    atualizarFoto();
  });

  document
    .querySelectorAll(".miniatura")
    .forEach((item) => {
      item.addEventListener("click", () => {
        fotoAtual =
          Number(item.dataset.index);

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

  const imagemPrincipal =
    fotos?.[0] ||
    "https://volante.app.br/assets/logo.png";

  atualizarOpenGraph({
    titulo,
    descricao,
    imagem: imagemPrincipal,
    url: window.location.href
  });

  conteudo.innerHTML = `
    <section class="detalhe">

      <div class="galeria">
        <div class="foto-principal-wrap">

          ${
            fotos.length > 1
              ? `
                <button
                  class="seta-foto seta-foto-esquerda"
                  id="fotoAnterior"
                >
                  ‹
                </button>
              `
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
              ? `
                <button
                  class="seta-foto seta-foto-direita"
                  id="fotoProxima"
                >
                  ›
                </button>
              `
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
            ? `
              <div class="preco">
                ${escapeHtml(preco)}
              </div>
            `
            : ""
        }

        <div class="descricao">
          <h3>Descrição</h3>

          <p>
            ${escapeHtml(descricao)}
          </p>
        </div>

        <div class="cta-app">
          <h3>
            Aplicativo disponível nas lojas
          </h3>

          <p>
            Converse com anunciantes,
            publique veículos e favorite anúncios.
          </p>

          <div class="app-store-box">

            <a
              class="app-store-btn"
              href="#"
              onclick="baixarApp(); return false;"
            >
              Google Play
            </a>

            <a
              class="app-store-btn"
              href="#"
              onclick="baixarApp(); return false;"
            >
              App Store
            </a>

          </div>
        </div>

        <div class="bloco compartilhar">

          <h3>Compartilhar</h3>

          <p>
            Compartilhe este conteúdo.
          </p>

          <div class="share-grid">

            <button
              class="share-btn link"
              onclick="compartilharConteudo('${escapeHtml(titulo)}')"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M8 12a4 4 0 0 1 4-4h4"/>
                <path d="M16 12a4 4 0 0 1-4 4H8"/>
                <path d="M9 15l-3-3 3-3"/>
                <path d="M15 9l3 3-3 3"/>
              </svg>

              <span>Compartilhar</span>
            </button>

          </div>

        </div>

      </div>

    </section>
  `;

  iniciarGaleria();
}

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
      const referencia =
        doc(db, colecao, id);

      const snapshot =
        await getDoc(referencia);

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

    renderizar({
      id: snapshotEncontrado.id,
      ...snapshotEncontrado.data()
    }, colecaoUsada);

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
