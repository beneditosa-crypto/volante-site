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

const params =
  new URLSearchParams(
    window.location.search
  );

const id =
  params.get("id");

const tipo =
  params.get("tipo") === "evento"
    ? "evento"
    : "anuncio";

const colecao =
  tipo === "evento"
    ? "eventos"
    : "anuncios";

let itemAtual = null;
let indiceAtual = 0;
let imagensAtuais = [];

window.baixarApp =
  baixarApp;

window.trocarFoto =
  function (url) {
    const principal =
      document.getElementById(
        "fotoPrincipal"
      );

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

    indiceAtual =
      imagensAtuais.indexOf(url);
  };

function avancarFoto(direcao) {
  if (
    !imagensAtuais.length
  ) return;

  indiceAtual += direcao;

  if (indiceAtual < 0) {
    indiceAtual =
      imagensAtuais.length - 1;
  }

  if (
    indiceAtual >=
    imagensAtuais.length
  ) {
    indiceAtual = 0;
  }

  window.trocarFoto(
    imagensAtuais[indiceAtual]
  );
}

window.compartilharWhatsApp =
  function () {
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

window.compartilharEmail =
  function () {
    if (!itemAtual) return;

    const titulo =
      itemAtual.titulo ||
      itemAtual.nome ||
      "Anúncio";

    const url =
      window.location.href;

    const assunto =
      encodeURIComponent(
        `Volante App: ${titulo}`
      );

    const corpo =
      encodeURIComponent(
        `Olha este ${tipo === "evento" ? "evento" : "anúncio"} que eu vi no Volante:\n\n${titulo}\n${url}`
      );

    window.location.href =
      `mailto:?subject=${assunto}&body=${corpo}`;
  };

window.compartilharFacebook =
  function () {
    const url =
      encodeURIComponent(
        window.location.href
      );

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

function atualizarMetas(
  item
) {
  const titulo =
    item.titulo ||
    item.nome ||
    "Volante App";

  document.title =
    `${titulo} | Volante App`;
}

function ativarSwipe() {
  const foto =
    document.getElementById(
      "fotoPrincipal"
    );

  if (!foto) return;

  let inicioX = 0;

  foto.addEventListener(
    "touchstart",
    (e) => {
      inicioX =
        e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  foto.addEventListener(
    "touchend",
    (e) => {
      const fimX =
        e.changedTouches[0].screenX;

      const diferenca =
        inicioX - fimX;

      if (diferenca > 40) {
        avancarFoto(1);
      }

      if (diferenca < -40) {
        avancarFoto(-1);
      }
    },
    { passive: true }
  );
}

function renderizar(item) {
  itemAtual = item;

  atualizarMetas(item);

  imagensAtuais =
    getImagens(item);

  const imagemPrincipal =
    imagensAtuais[0] || "";

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
      : item.ano ||
        item.anoFabricacao ||
        "";

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

  document.getElementById(
    "conteudo"
  ).innerHTML = `
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
              : `
                <div class="foto-principal"></div>
              `
          }

          <span class="tipo-badge">
            ${tipoTexto}
          </span>
        </div>

        ${
          imagensAtuais.length > 1
            ? `
              <div class="miniaturas">
                ${imagensAtuais
                  .map(
                    (
                      img,
                      index
                    ) => `
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
          ${[
            ano,
            data,
            local
          ]
            .filter(Boolean)
            .join(" • ")}
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
            A visualização é pública.
            Para ver contato,
            conversar com o anunciante,
            publicar ou salvar favoritos,
            entre pelo app Volante.
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
            <h3>
              Compartilhar
            </h3>

            <p>
              Envie este ${tipo === "evento" ? "evento" : "anúncio"} para amigos e grupos.
            </p>

            <div class="share-grid">
              <button
                class="share-btn share-whatsapp"
                onclick="compartilharWhatsApp()"
                title="WhatsApp"
              >
                <svg
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M19.11 17.21c-.29-.14-1.72-.85-1.98-.95-.27-.1-.46-.14-.66.14-.19.29-.75.95-.92 1.15-.17.19-.34.22-.63.07-.29-.14-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.66-1.58-.9-2.17-.24-.58-.49-.5-.66-.51h-.56c-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.44 0 1.44 1.05 2.83 1.19 3.03.14.19 2.06 3.15 4.99 4.42.7.3 1.25.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.56-.34ZM16.02 3.2c-7 0-12.67 5.67-12.67 12.67 0 2.23.58 4.32 1.59 6.14L3.2 28.8l6.98-1.82a12.6 12.6 0 0 0 5.84 1.49h.01c7 0 12.67-5.67 12.67-12.67 0-3.39-1.32-6.58-3.72-8.97A12.6 12.6 0 0 0 16.02 3.2Z"/>
                </svg>
              </button>

              <button
                class="share-btn share-email"
                onclick="compartilharEmail()"
                title="E-mail"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 3.24V18h16V7.24l-8 6-8-6Zm.8-1.24 7.2 5.4 7.2-5.4H4.8Z"/>
                </svg>
              </button>

              <button
                class="share-btn share-facebook"
                onclick="compartilharFacebook()"
                title="Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.87.24-1.46 1.5-1.46H17V4.96c-.34-.05-1.5-.14-2.84-.14-2.8 0-4.72 1.7-4.72 4.86V11H6.5v3h2.94v8h4.06Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </section>
  `;

  ativarSwipe();
}

async function carregar() {
  const conteudo =
    document.getElementById(
      "conteudo"
    );

  if (!id) {
    conteudo.innerHTML =
      `<div class="erro">Conteúdo não encontrado.</div>`;

    return;
  }

  try {
    const ref =
      doc(
        db,
        colecao,
        id
      );

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

    if (
      dados.status !==
      "ATIVO"
    ) {
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
