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
      >
        <svg viewBox="0 0 24 24" fill="${favorito ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M12 21s-6.7-4.35-9.33-8.06C.7 10.18 2.08 6.5 5.6 5.7c2.02-.46 3.73.32 4.4 1.43.67-1.11 2.38-1.89 4.4-1.43 3.52.8 4.9 4.48 2.93 7.24C18.7 16.65 12 21 12 21Z"/>
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
