import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

import {
  escapeHtml,
  getImagens,
  textoLocal,
  formatarPreco,
  formatarData,
  baixarApp
} from "./shared.js";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const tipo =
  params.get("tipo") === "evento"
    ? "evento"
    : "anuncio";

const colecao =
  tipo === "evento"
    ? "eventos"
    : "anuncios";

let itemAtual = null;

window.baixarApp = baixarApp;

window.trocarFoto = function (url) {
  const principal =
    document.getElementById("fotoPrincipal");

  if (principal) {
    principal.src = url;
  }

  document
    .querySelectorAll(".miniatura")
    .forEach((img) => {
      img.classList.toggle(
        "ativa",
        img.getAttribute("src") === url
      );
    });
};

window.compartilharWhatsApp = function () {
  if (!itemAtual) return;

  const titulo =
    itemAtual.titulo ||
    itemAtual.nome ||
    "anúncio";

  const url =
    window.location.href;

  const mensagem =
    encodeURIComponent(
      `Olha este ${tipo === "evento" ? "evento" : "anúncio"} que eu vi no Volante:\n\n${titulo}\n${url}\n\nBaixe o app e anuncie você também.`
    );

  window.open(
    `https://wa.me/?text=${mensagem}`,
    "_blank"
  );
};

window.compartilharEmail = function () {
  if (!itemAtual) return;

  const titulo =
    itemAtual.titulo ||
    itemAtual.nome ||
    "Anúncio no Volante";

  const url =
    window.location.href;

  const assunto =
    encodeURIComponent(
      `Volante App: ${titulo}`
    );

  const corpo =
    encodeURIComponent(
      `Olha este ${tipo === "evento" ? "evento" : "anúncio"} que eu vi no Volante:\n\n${titulo}\n${url}\n\nBaixe o app e anuncie você também.`
    );

  window.location.href =
    `mailto:?subject=${assunto}&body=${corpo}`;
};

window.compartilharFacebook = function () {
  const url =
    encodeURIComponent(window.location.href);

  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    "_blank"
  );
};

function atualizarMetas(item) {
  const titulo =
    item.titulo ||
    item.nome ||
    "Volante App";

  document.title =
    `${titulo} | Volante App`;

  const description =
    document.querySelector(
      'meta[name="description"]'
    );

  if (description) {
    description.setAttribute(
      "content",
      `Veja ${tipo === "evento" ? "este evento" : "este anúncio"} no Volante App.`
    );
  }
}

function renderizar(item) {
  itemAtual = item;

  atualizarMetas(item);

  const imagens =
    getImagens(item);

  const imagemPrincipal =
    imagens[0] || "";

  const titulo =
    item.titulo ||
    item.nome ||
    "Detalhe";

  const local =
    textoLocal(item);

  const preco =
    tipo === "evento"
      ? ""
      : formatarPreco(item.preco);

  const ano =
    tipo === "evento"
      ? ""
      : item.ano || item.anoFabricacao || "";

  const data =
    tipo === "evento"
      ? formatarData(
          item.dataEvento ||
          item.data ||
          item.criadoEm
        )
      : "";

  const descricao =
    item.descricao || "";

  const tipoTexto =
    tipo === "evento"
      ? "Evento"
      : "Anúncio";

  document.getElementById("conteudo").innerHTML = `
    <section class="detalhe">
      <div class="galeria">
        <div class="foto-principal-wrap">
          ${
            imagemPrincipal
              ? `
                <img
                  id="fotoPrincipal"
                  class="foto-principal"
                  src="${imagemPrincipal}"
                  alt="${escapeHtml(titulo)}"
                />
              `
              : `<div class="foto-principal"></div>`
          }

          <span class="tipo-badge">
            ${tipoTexto}
          </span>
        </div>

        ${
          imagens.length > 1
            ? `
              <div class="miniaturas">
                ${imagens
                  .map(
                    (img, index) => `
                      <img
                        class="miniatura ${index === 0 ? "ativa" : ""}"
                        src="${img}"
                        alt="Foto ${index + 1}"
                        onclick="trocarFoto('${img}')"
                      />
                    `
                  )
                  .join("")}
              </div>
            `
            : ""
        }
      </div>

      <aside class="painel">
        <h1 class="titulo">
          ${escapeHtml(titulo)}
        </h1>

        <div class="meta">
          ${[ano, data, local].filter(Boolean).join(" • ")}
        </div>

        ${
          preco
            ? `
              <div class="preco">
                ${escapeHtml(preco)}
              </div>
            `
            : ""
        }

        ${
          descricao
            ? `
              <div class="descricao">
                <h3>Descrição</h3>

                <p>
                  ${escapeHtml(descricao)}
                </p>
              </div>
            `
            : ""
        }

        <div class="cta-app">
          <strong>
            Quer falar com o anunciante?
          </strong>

          <p>
            A visualização é pública. Para ver contato,
            conversar com o anunciante, publicar ou salvar
            favoritos, entre pelo app Volante.
          </p>

          <button
            class="btn-app"
            onclick="baixarApp()"
          >
            Ver contato no app
          </button>
        </div>

        <div class="compartilhar">
          <div class="bloco">
            <h3>Compartilhar</h3>

            <p>
              Envie este ${tipo === "evento" ? "evento" : "anúncio"} para amigos e grupos.
            </p>

            <div class="share-grid">
              <button
                class="share-btn share-whatsapp"
                onclick="compartilharWhatsApp()"
                title="WhatsApp"
              >
                ☘
              </button>

              <button
                class="share-btn share-email"
                onclick="compartilharEmail()"
                title="E-mail"
              >
                ✉
              </button>

              <button
                class="share-btn share-facebook"
                onclick="compartilharFacebook()"
                title="Facebook"
              >
                f
              </button>
            </div>
          </div>
        </div>
      </aside>
    </section>
  `;
}

async function carregar() {
  const conteudo =
    document.getElementById("conteudo");

  if (!id) {
    conteudo.innerHTML =
      `<div class="erro">Conteúdo não encontrado.</div>`;

    return;
  }

  try {
    const ref =
      doc(db, colecao, id);

    const snap =
      await getDoc(ref);

    if (!snap.exists()) {
      conteudo.innerHTML =
        `<div class="erro">Conteúdo não encontrado.</div>`;

      return;
    }

    const dados = {
      id: snap.id,
      ...snap.data()
    };

    if (dados.status !== "ATIVO") {
      conteudo.innerHTML =
        `<div class="erro">Este conteúdo não está disponível.</div>`;

      return;
    }

    renderizar(dados);
  } catch (error) {
    console.error(error);

    conteudo.innerHTML =
      `<div class="erro">Erro ao carregar o conteúdo.</div>`;
  }
}

carregar();
