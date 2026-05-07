import {
  escapeHtml,
  getImagem,
  textoLocal,
  ehFavorito,
  toggleFavorito
} from "./shared.js";

window.toggleFavorito = toggleFavorito;

export function imagemHtml(item, titulo) {
  const imagem = getImagem(item);
  const favorito = ehFavorito(item.id);

  return `
    <div class="foto-wrap">
      <button
        class="btn-favorito ${favorito ? "ativo" : ""}"
        onclick="event.stopPropagation(); toggleFavorito('${item.id}')"
        aria-label="Favoritar"
        title="Favoritar"
      >
        <svg
          viewBox="0 0 24 24"
          fill="${favorito ? "currentColor" : "none"}"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        >
          <path d="M12 2.7l2.9 5.88 6.5.94-4.7 4.58 1.1 6.47L12 17.5l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.94L12 2.7Z"/>
        </svg>
      </button>

      <img class="foto" src="${imagem}" alt="${escapeHtml(titulo)}" loading="lazy" decoding="async" />

      <div class="overlay"></div>

      <div class="overlay-content">
        <div class="overlay-text">${escapeHtml(titulo)}</div>
        <span class="ver-mais">Ver detalhes</span>
      </div>
    </div>
  `;
}

export function cardAnuncio(item) {
  const titulo =
    item.titulo ||
    `${item.marca || ""} ${item.modelo || ""}`.trim() ||
    "Anúncio";

  const local = textoLocal(item);

  return `
    <article class="card" onclick="window.location.href='./detalhe.html?tipo=anuncio&id=${item.id}'">
      ${imagemHtml(item, titulo)}

      <div class="card-body">
        <div class="meta">${escapeHtml(local)}</div>
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
    <article class="card" onclick="window.location.href='./detalhe.html?tipo=evento&id=${item.id}'">
      ${imagemHtml(item, titulo)}

      <div class="card-body">
        <div class="meta">${escapeHtml(local)}</div>
      </div>
    </article>
  `;
}

export function renderizarGrid(elemento, lista, criador, vazioTexto) {
  if (!elemento) return;

  if (!lista.length) {
    elemento.innerHTML = `<div class="empty">${vazioTexto}</div>`;
    return;
  }

  elemento.innerHTML =
    lista.map(criador).join("");
}
