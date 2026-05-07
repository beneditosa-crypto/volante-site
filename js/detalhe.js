import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  escapeHtml,
  textoLocal,
  formatarPreco,
  getFotos,
  atualizarMetaDetalhe
} from "./shared.js";

const conteudo =
  document.getElementById("conteudo");

const params =
  new URLSearchParams(window.location.search);

const id = params.get("id");

const tipo =
  params.get("tipo") === "evento"
    ? "eventos"
    : "anuncios";

if (!id) {
  conteudo.innerHTML = `
    <div class="empty">
      Item não encontrado.
    </div>
  `;
} else {
  carregar();
}

async function carregar() {
  try {
    const ref = doc(db, tipo, id);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      conteudo.innerHTML = `
        <div class="empty">
          Conteúdo não encontrado.
        </div>
      `;
      return;
    }

    const item = {
      id: snap.id,
      ...snap.data()
    };

    renderizar(item);

  } catch (erro) {
    console.error(erro);

    conteudo.innerHTML = `
      <div class="empty">
        Erro ao carregar detalhe.
      </div>
    `;
  }
}

function renderizar(item) {
  const titulo =
    item.titulo ||
    item.nome ||
    `${item.marca || ""} ${item.modelo || ""}`.trim();

  const fotos =
    getFotos(item);

  const descricao =
    item.descricao ||
    "Sem descrição.";

  const local =
    textoLocal(item);

  const preco =
    formatarPreco(item.preco);

  atualizarMetaDetalhe({
    titulo,
    descricao,
    imagem: fotos[0]
  });

  conteudo.innerHTML = `
    <section class="detalhe">
      <div class="galeria">
        <div class="foto-principal-wrap">
          <img
            class="foto-principal"
            src="${fotos[0]}"
            alt="${escapeHtml(titulo)}"
          />
        </div>

        <div class="miniaturas">
          ${fotos.map((foto) => `
            <img
              class="miniatura"
              src="${foto}"
              alt="${escapeHtml(titulo)}"
            />
          `).join("")}
        </div>
      </div>

      <div class="painel">
        <h1 class="titulo">
          ${escapeHtml(titulo)}
        </h1>

        <div class="meta">
          ${escapeHtml(local)}
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

        <div class="descricao">
          <h3>Descrição</h3>

          <p>
            ${escapeHtml(descricao)}
          </p>
        </div>
      </div>
    </section>
  `;
}
