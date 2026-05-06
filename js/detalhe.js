# detalhe.js (COMPLETO E CORRIGIDO)

```javascript
import { db } from "./firebase.js";
import { baixarApp } from "./shared.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.baixarApp = baixarApp;

const conteudo = document.getElementById("conteudo");

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

async function carregarDetalhe() {
  if (!id) {
    conteudo.innerHTML = `
      <div class="loading">
        Item não encontrado.
      </div>
    `;

    return;
  }

  try {
    const anuncioRef = doc(db, "anuncios", id);

    const anuncioSnap = await getDoc(anuncioRef);

    if (!anuncioSnap.exists()) {
      conteudo.innerHTML = `
        <div class="loading">
          Item não encontrado.
        </div>
      `;

      return;
    }

    const item = {
      id: anuncioSnap.id,
      ...anuncioSnap.data(),
    };

    renderizar(item);
  } catch (error) {
    console.error(error);

    conteudo.innerHTML = `
      <div class="loading">
        Erro ao carregar detalhe.
      </div>
    `;
  }
}

function formatarPreco(valor) {
  if (!valor) return "";

  if (typeof valor === "string" && valor.includes("R$")) {
    return valor;
  }

  const numero = Number(String(valor).replace(/\D/g, ""));

  if (isNaN(numero)) {
    return valor;
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function renderizar(item) {
  const fotos =
    item.fotos && item.fotos.length
      ? item.fotos
      : item.imagem
      ? [item.imagem]
      : ["https://placehold.co/1200x900?text=Volante"];

  const fotoPrincipal = fotos[0];

  const titulo =
    item.titulo || "Veículo anunciado";

  const preco = formatarPreco(item.preco);

  const cidade = item.cidade || "";

  const estado = item.estado || "";

  const descricao =
    item.descricao ||
    "Sem descrição.";

  const tipo =
    item.tipo === "EVENTO"
      ? "Evento"
      : "Anúncio";

  const urlAtual = window.location.href;

  const textoCompartilhar =
    `${titulo} no Volante App`;

  const whatsapp =
    `https://wa.me/?text=${encodeURIComponent(
      textoCompartilhar + " " + urlAtual
    )}`;

  const facebook =
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      urlAtual
    )}`;

  const email =
    `mailto:?subject=${encodeURIComponent(
      textoCompartilhar
    )}&body=${encodeURIComponent(urlAtual)}`;

  conteudo.innerHTML = `
    <section class="detalhe">
      <div class="galeria">
        <div class="foto-principal-wrap">
          <img
            id="fotoPrincipal"
            class="foto-principal"
            src="${fotoPrincipal}"
            alt="${titulo}"
          />

          <div class="tipo-badge">
            ${tipo}
          </div>
        </div>

        <div class="miniaturas">
          ${fotos
            .map(
              (foto, index) => `
                <img
                  class="miniatura ${
                    index === 0 ? "ativa" : ""
                  }"
                  src="${foto}"
                  alt="${titulo}"
                  data-foto="${foto}"
                />
              `
            )
            .join("")}
        </div>
      </div>

      <div class="painel">
        <h1 class="titulo">
          ${titulo}
        </h1>

        <div class="meta">
          ${cidade}${estado ? ` • ${estado}` : ""}
        </div>

        ${preco ? `<div class="preco">${preco}</div>` : ""}

        <div class="descricao">
          <h3>
            Descrição
          </h3>

          <p>
            ${descricao}
          </p>
        </div>

        <div class="cta-app">
          <h3>
            Aplicativo disponível nas lojas
          </h3>

          <p>
            Converse com anunciantes,
            publique veículos, favorite anúncios
            e acesse todos os recursos
            pelo aplicativo Volante.
          </p>

          <div class="app-store-box">
            <a
              class="app-store-btn"
              href="#"
              onclick="baixarApp(); return false;"
            >
              <svg viewBox="0 0 24 24">
                <path d="M4 3.5v17l10.5-8.5L4 3.5Zm11.8 7.4 2.5-2.1L6.5 2.4l9.3 8.5Zm2.5 4.3-2.5-2.1-9.3 8.5 11.8-6.4Zm1.1-5.4-2.7 2.2 2.7 2.2 1.8-1c1-.6 1-2 0-2.6l-1.8-.8Z"/>
              </svg>

              Google Play
            </a>

            <a
              class="app-store-btn"
              href="#"
              onclick="baixarApp(); return false;"
            >
              <svg viewBox="0 0 24 24">
                <path d="M16.6 13.1c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.6-2.1.8-1.2 1.1-2.3 1.2-2.4 0 0-2.6-1-2.6-3.4ZM14.5 6.9c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3Z"/>
              </svg>

              App Store
            </a>
          </div>
        </div>

        <div class="compartilhar">
          <div class="bloco">
            <h3>
              Compartilhar
            </h3>

            <p>
              Envie este anúncio para amigos e grupos.
            </p>

            <div class="share-grid">
              <a
                class="share-btn share-whatsapp"
                href="${whatsapp}"
                target="_blank"
              >
                <svg
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M19.11 17.41c-.29-.14-1.69-.83-1.95-.92-.26-.1-.45-.14-.64.15-.19.29-.73.92-.89 1.11-.16.19-.33.22-.62.07-.29-.14-1.22-.45-2.33-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.33.43-.49.14-.16.19-.28.29-.47.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-.96 2.43.05 1.43 1.03 2.81 1.18 3 .14.19 2.03 3.1 5.02 4.23 2.99 1.13 2.99.75 3.53.7.54-.05 1.69-.69 1.93-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33ZM16.03 3.2c-7.02 0-12.71 5.69-12.71 12.71 0 2.24.59 4.43 1.71 6.35L3.2 28.8l6.71-1.76a12.66 12.66 0 0 0 6.12 1.56h.01c7.01 0 12.71-5.69 12.71-12.71S23.05 3.2 16.03 3.2Zm0 23.17h-.01a10.5 10.5 0 0 1-5.35-1.47l-.38-.22-3.98 1.04 1.06-3.88-.25-.4a10.47 10.47 0 0 1-1.62-5.55c0-5.79 4.72-10.51 10.52-10.51 2.8 0 5.43 1.09 7.41 3.07a10.4 10.4 0 0 1 3.08 7.44c0 5.8-4.72 10.51-10.48 10.51Z"/>
                </svg>
              </a>

              <a
                class="share-btn share-email"
                href="${email}"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <path d="m3 7 9 6 9-6"/>
                </svg>
              </a>

              <a
                class="share-btn share-facebook"
                href="${facebook}"
                target="_blank"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  iniciarGaleria();
}

function iniciarGaleria() {
  const fotoPrincipal =
    document.getElementById("fotoPrincipal");

  const miniaturas =
    document.querySelectorAll(".miniatura");

  miniaturas.forEach((miniatura) => {
    miniatura.addEventListener(
      "click",
      () => {
        fotoPrincipal.src =
          miniatura.dataset.foto;

        miniaturas.forEach((m) =>
          m.classList.remove("ativa")
        );

        miniatura.classList.add("ativa");
      }
    );
  });
}

carregarDetalhe();
```

---

# detalhe.css (COMPLETO E CORRIGIDO)
