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

  const preco =
    item.preco
      ? formatarPreco(item.preco)
      : "";

  if (editorial) {
    return `
      <div class="foto-wrap editorial">

        <img
          class="foto"
          src="${imagem}"
          alt="${escapeHtml(titulo)}"
          loading="lazy"
          decoding="async"
        />

        <div class="overlay editorial"></div>

         <div class="overlay-content editorial">

          <div class="overlay-text editorial">
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

  return `
    <div class="foto-wrap">

      <img
        class="foto"
        src="${imagem}"
        alt="${escapeHtml(titulo)}"
        loading="lazy"
        decoding="async"
      />

      <div class="overlay"></div>

      <div class="overlay-content">

        <div class="overlay-text">
          ${escapeHtml(titulo)}
        </div>

        <span class="ver-mais">
          Ver detalhes
        </span>

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

  if (editorial) {

    return `
      <article
        class="card card-editorial ${destaque ? "destaque" : ""}"
        onclick="window.location.href='./detalhe.html?tipo=anuncio&id=${item.id}'"
      >

        ${imagemHtml(item, titulo, true)}

      </article>
    `;

  }

  return `
    <article
      class="card ${destaque ? "destaque" : ""}"
      onclick="window.location.href='./detalhe.html?tipo=anuncio&id=${item.id}'"
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
