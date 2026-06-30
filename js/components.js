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
    <div class="foto-wrap ${editorial ? "editorial" : ""}">
      <img
        class="foto"
        src="${imagem}"
        alt="${escapeHtml(titulo)}"
        loading="lazy"
        decoding="async"
      />

      <div class="overlay ${editorial ? "editorial" : ""}"></div>

      <div class="overlay-content ${editorial ? "editorial" : ""}">
        <div class="overlay-text ${editorial ? "editorial" : ""}">
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

  return `
    <article
      class="card ${editorial ? "card-editorial" : ""} ${destaque ? "destaque" : ""}"
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
      class="card"
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
