/* ===========================================================
   VOLANTE APP — COMPONENTS.JS
   Finalidade:
   Componentes reutilizáveis do site público.

   Referência:
   Plano Diretor Oficial + Protótipo Oficial Premium.

   Responsabilidades:
   - Renderizar cards de anúncios.
   - Renderizar cards de eventos.
   - Renderizar imagens com overlay premium.
   - Padronizar destaque, preço, local e navegação.
   - Preservar estrutura limpa e reutilizável.
=========================================================== */

import {
  escapeHtml,
  getImagem,
  textoLocal,
  formatarPreco
} from "./shared.js";

/* ===========================================================
   01. REGRAS DE DESTAQUE
=========================================================== */

function ehDestaque(item) {
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

/* ===========================================================
   02. DADOS FORMATADOS
=========================================================== */

function tituloAnuncio(item) {
  return (
    item.titulo ||
    `${item.marca || ""} ${item.modelo || ""}`.trim() ||
    "Anúncio"
  );
}

function tituloEvento(item) {
  return (
    item.titulo ||
    item.nome ||
    "Evento"
  );
}

function precoAnuncio(item) {
  return item.preco
    ? formatarPreco(item.preco)
    : "";
}

/* ===========================================================
   03. IMAGEM PREMIUM COM OVERLAY
=========================================================== */

export function imagemHtml(item, titulo, editorial = false, tipo = "anuncio") {
  const imagem = getImagem(item);
  const local = textoLocal(item);
  const preco = tipo === "anuncio" ? precoAnuncio(item) : "";

  return `
    <div class="foto-wrap ${editorial ? "foto-editorial" : "foto-comum"}">
      <img
        class="foto"
        src="${imagem}"
        alt="${escapeHtml(titulo)}"
        loading="lazy"
        decoding="async"
      />

      <div class="overlay ${editorial ? "overlay-editorial" : "overlay-comum"}"></div>

      ${ehDestaque(item) ? `<span class="badge-destaque">Destaque</span>` : ""}

      <div class="overlay-content ${editorial ? "overlay-content-editorial" : "overlay-content-comum"}">
        <div class="overlay-text ${editorial ? "overlay-text-editorial" : "overlay-text-comum"}">
          ${escapeHtml(titulo)}
        </div>

        ${
          preco
            ? `<div class="overlay-preco">${escapeHtml(preco)}</div>`
            : ""
        }

        ${
          local
            ? `<div class="overlay-local">${escapeHtml(local)}</div>`
            : ""
        }
      </div>
    </div>
  `;
}

/* ===========================================================
   04. CARD DE ANÚNCIO
=========================================================== */

export function cardAnuncio(item, editorial = false) {
  const titulo = tituloAnuncio(item);
  const destaque = ehDestaque(item);

  const classes = [
    "card",
    "card-anuncio",
    editorial ? "card-editorial" : "card-comum",
    destaque ? "destaque" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <article
      class="${classes}"
      onclick="window.location.href='./detalhe.html?tipo=anuncio&id=${encodeURIComponent(item.id)}'"
      role="link"
      tabindex="0"
      aria-label="${escapeHtml(titulo)}"
    >
      ${imagemHtml(item, titulo, editorial, "anuncio")}
    </article>
  `;
}

/* ===========================================================
   05. CARD DE EVENTO
=========================================================== */

export function cardEvento(item) {
  const titulo = tituloEvento(item);

  return `
    <article
      class="card card-evento card-comum"
      onclick="window.location.href='./detalhe.html?tipo=evento&id=${encodeURIComponent(item.id)}'"
      role="link"
      tabindex="0"
      aria-label="${escapeHtml(titulo)}"
    >
      ${imagemHtml(item, titulo, false, "evento")}
    </article>
  `;
}

/* ===========================================================
   06. GRID GENÉRICO
=========================================================== */

export function renderizarGrid(
  elemento,
  lista,
  criador,
  vazioTexto
) {
  if (!elemento) return;

  if (!lista.length) {
    elemento.innerHTML = `
      <div class="empty">
        ${escapeHtml(vazioTexto)}
      </div>
    `;

    return;
  }

  elemento.innerHTML = lista
    .map(criador)
    .join("");
}
