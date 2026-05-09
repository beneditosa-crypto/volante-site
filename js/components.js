import {
  escapeHtml,
  getImagem,
  textoLocal
} from "./shared.js";

export function destaqueAtivo(item) {
  return (
    item.destaque === true ||
    item.destaque === "true" ||
    item.destaque === "SIM" ||
    item.destaque === "sim" ||
    item.destaque === 1
  );
}

export function imagemHtml(item, titulo, destaque = false) {
  const imagem = getImagem(item);

  return `
    <div class="foto-wrap">
      ${
        destaque
          ? `<div class="estrela-destaque" title="Destaque">★</div>`
          : ""
      }

      <img
        class="foto"
        src="${imagem}"
        alt="${escapeHtml(titulo)}"
        loading="lazy"
        decoding="async"
      />
    </div>
  `;
}

export function cardAnuncio(item) {
  const titulo =
    item.titulo ||
    `${item.marca || ""} ${item.modelo || ""}`.trim() ||
    "Anúncio";

  const local = textoLocal(item);
  const destaque = destaqueAtivo(item);

  return `
    <article
      class="card ${destaque ? "destaque" : ""}"
      onclick="window.location.href='./detalhe.html?tipo=anuncio&id=${item.id}'"
    >
      ${imagemHtml(item, titulo, destaque)}

      <div class="card-body">
        <div class="card-title">${escapeHtml(titulo)}</div>
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
    <article
      class="card"
      onclick="window.location.href='./detalhe.html?tipo=evento&id=${item.id}'"
    >
      ${imagemHtml(item, titulo, false)}

      <div class="card-body">
        <div class="card-title">${escapeHtml(titulo)}</div>
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

  elemento.innerHTML = lista.map(criador).join("");
}
