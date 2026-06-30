import {
  escapeHtml,
  getImagem,
  textoLocal,
  formatarPreco
} from "./shared.js";

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

export function imagemHtml(item, titulo, editorial = false) {
  const imagem = getImagem(item);
  const local = textoLocal(item);

  const preco = item.preco
    ? formatarPreco(item.preco)
    : "";

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

      <div class="overlay-content ${editorial ? "overlay-content-editorial" : "overlay-content-comum"}">
        <div class="overlay-text ${editorial ? "overlay-text-editorial" : "overlay-text-comum"}">
          ${escapeHtml(titulo)}
        </div>

        ${
          editorial && preco
            ? `<div class="overlay-preco">${escapeHtml(preco)}</div>`
            : ""
        }

        ${
          editorial && local
            ? `<div class="overlay-local">${escapeHtml(local)}</div>`
            : ""
        }

        ${
          !editorial
            ? `<span class="ver-mais">Ver detalhes</span>`
            : ""
        }
      </div>
    </div>
  `;
}

export function cardAnuncio(item, editorial = false) {
  const titulo =
    item.titulo ||
    `${item.marca || ""} ${item.modelo || ""}`.trim() ||
    "Anúncio";

  const local = textoLocal(item);
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
      onclick="window.location.href='./detalhe.html?tipo=anuncio&id=${item.id}'"
    >
      ${imagemHtml(item, titulo, editorial)}

      ${
        editorial
          ? ""
          : `
            <div class="card-body">
              <div class="meta">
                ${escapeHtml(local)}
              </div>
            </div>
          `
      }
    </article>
  `;
}

export function cardEvento(item) {
  const titulo =
    item.titulo ||
    item.nome ||
    "Evento";

  const local = textoLocal(item);

  return `
    <article
      class="card card-evento card-comum"
      onclick="window.location.href='./detalhe.html?tipo=evento&id=${item.id}'"
    >
      ${imagemHtml(item, titulo)}

      <div class="card-body">
        <div class="meta">
          ${escapeHtml(local)}
        </div>
      </div>
    </article>
  `;
}

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
        ${vazioTexto}
      </div>
    `;

    return;
  }

  elemento.innerHTML = lista
    .map(criador)
    .join("");
}
