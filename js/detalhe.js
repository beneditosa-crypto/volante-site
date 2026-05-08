import { db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  baixarApp,
  escapeHtml,
  formatarPreco,
  getFotos,
  textoLocal
} from "./shared.js";

window.baixarApp = baixarApp;

const conteudo = document.getElementById("conteudo");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const tipo = (params.get("tipo") || "anuncio").toLowerCase();

let fotos = [];
let fotoAtual = 0;

const debugAtivo =
  params.get("debug") === "1";

const debugPassos = [];

function registrarDebug(mensagem, extra = "") {
  const horario = new Date().toLocaleTimeString("pt-BR");
  debugPassos.push(`[${horario}] ${mensagem}${extra ? " — " + extra : ""}`);
  console.log("[Volante detalhe]", mensagem, extra || "");
}

function mostrarDebug(titulo, erro = "") {
  if (!debugAtivo) return;

  conteudo.innerHTML = `
    <div class="debug-box">
      <h3>${escapeHtml(titulo)}</h3>
      <p>Modo diagnóstico ativo.</p>
      <pre>${escapeHtml(debugPassos.join("\n"))}${erro ? "\n\nERRO:\n" + escapeHtml(String(erro)) : ""}</pre>
    </div>
  `;
}

function mostrarErro(texto, erro = "") {
  if (debugAtivo) {
    mostrarDebug(texto, erro);
    return;
  }

  conteudo.innerHTML = `
    <div class="empty">
      ${escapeHtml(texto)}
    </div>
  `;
}

function atualizarMetaTag(property, content) {
  if (!content) return;

  let element =
    document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`);

  if (!element) {
    element = document.createElement("meta");

    if (property.startsWith("og:")) {
      element.setAttribute("property", property);
    } else {
      element.setAttribute("name", property);
    }

    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function atualizarOpenGraph({
  titulo,
  descricao,
  imagem,
  url
}) {
  document.title = `${titulo} | Volante App`;

  atualizarMetaTag("description", descricao);

  atualizarMetaTag("og:title", titulo);
  atualizarMetaTag("og:description", descricao);
  atualizarMetaTag("og:image", imagem);
  atualizarMetaTag("og:url", url);
  atualizarMetaTag("og:type", "website");

  atualizarMetaTag("twitter:card", "summary_large_image");
  atualizarMetaTag("twitter:title", titulo);
  atualizarMetaTag("twitter:description", descricao);
  atualizarMetaTag("twitter:image", imagem);

  let canonical =
    document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);

  registrarDebug("Open Graph atualizado");
}

function atualizarFoto() {
  const fotoPrincipal = document.getElementById("fotoPrincipal");

  if (!fotoPrincipal) return;

  fotoPrincipal.src = fotos[fotoAtual];

  document.querySelectorAll(".miniatura").forEach((item, index) => {
    item.classList.toggle("ativa", index === fotoAtual);
  });
}

function iniciarGaleria() {
  const anterior = document.getElementById("fotoAnterior");
  const proxima = document.getElementById("fotoProxima");

  anterior?.addEventListener("click", () => {
    fotoAtual = fotoAtual === 0 ? fotos.length - 1 : fotoAtual - 1;
    atualizarFoto();
  });

  proxima?.addEventListener("click", () => {
    fotoAtual = fotoAtual === fotos.length - 1 ? 0 : fotoAtual + 1;
    atualizarFoto();
  });

  document.querySelectorAll(".miniatura").forEach((item) => {
    item.addEventListener("click", () => {
      fotoAtual = Number(item.dataset.index);
      atualizarFoto();
    });
  });
}

function renderizar(item, colecaoUsada) {
  registrarDebug("Renderização iniciada", `colecao=${colecaoUsada}`);

  fotos = getFotos(item);

  const titulo =
    item.titulo ||
    item.nome ||
    `${item.marca || ""} ${item.modelo || ""}`.trim() ||
    "Volante";

  const descricao =
    item.descricao ||
    "Sem descrição.";

  const preco =
    formatarPreco(item.preco);

  const local =
    textoLocal(item);

  const ehEvento =
    colecaoUsada === "eventos";

  const urlAtual =
    window.location.href;

  const imagemPrincipal =
    fotos?.[0] ||
    "https://volante.app.br/assets/logo.png";

  const descricaoSeo =
    `${titulo}${preco ? " • " + preco : ""}${local ? " • " + local : ""}`;

  atualizarOpenGraph({
    titulo,
    descricao: descricaoSeo,
    imagem: imagemPrincipal,
    url: urlAtual
  });

  const whatsapp =
    `https://wa.me/?text=${encodeURIComponent(window.location.href)}`;

  const facebook =
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;

  const email =
    `mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(window.location.href)}`;

  conteudo.innerHTML = `
    <section class="detalhe">
      <div class="galeria">
        <div class="foto-principal-wrap">
          ${
            fotos.length > 1
              ? `<button class="seta-foto seta-foto-esquerda" id="fotoAnterior">‹</button>`
              : ""
          }

          <img
            id="fotoPrincipal"
            class="foto-principal"
            src="${fotos[0]}"
            alt="${escapeHtml(titulo)}"
          />

          ${
            fotos.length > 1
              ? `<button class="seta-foto seta-foto-direita" id="fotoProxima">›</button>`
              : ""
          }

          <div class="tipo-badge">
            ${ehEvento ? "EVENTO" : "ANÚNCIO"}
          </div>
        </div>

        ${
          fotos.length > 1
            ? `
              <div class="miniaturas">
                ${fotos.map((foto, index) => `
                  <img
                    class="miniatura ${index === 0 ? "ativa" : ""}"
                    src="${foto}"
                    data-index="${index}"
                  />
                `).join("")}
              </div>
            `
            : ""
        }
      </div>

      <div class="painel">
        <h1 class="titulo">${escapeHtml(titulo)}</h1>

        <div class="meta">${escapeHtml(local)}</div>

        ${
          preco && !ehEvento
            ? `<div class="preco">${escapeHtml(preco)}</div>`
            : ""
        }

        <div class="descricao">
          <h3>Descrição</h3>
          <p>${escapeHtml(descricao)}</p>
        </div>

        <div class="cta-app">
          <h3>Aplicativo disponível nas lojas</h3>
          <p>Converse com anunciantes, publique veículos e favorite anúncios.</p>

          <div class="app-store-box">
            <a class="app-store-btn" href="#" onclick="baixarApp(); return false;">Google Play</a>
            <a class="app-store-btn" href="#" onclick="baixarApp(); return false;">App Store</a>
          </div>
        </div>

        <div class="bloco">
          <h3>Compartilhar</h3>
          <p>Compartilhe este conteúdo.</p>

          <div class="share-grid">
            <a class="share-btn" target="_blank" href="${whatsapp}" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 3.9A10 10 0 0 0 4.3 16.1L3 21l5-1.3A10 10 0 1 0 20 3.9Z"/>
              </svg>
            </a>

            <a class="share-btn" href="${email}" aria-label="E-mail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16v16H4z"/>
                <path d="m22 6-10 7L2 6"/>
              </svg>
            </a>

            <a class="share-btn" target="_blank" href="${facebook}" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 22v-8h3l1-4h-4V8c0-1.2.3-2 2-2h2V2.5A26 26 0 0 0 14 2c-3 0-5 1.8-5 5.2V10H6v4h3v8z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  `;

  iniciarGaleria();
  registrarDebug("Renderização concluída");
}

async function carregar() {
  registrarDebug("Módulo detalhe.js carregado");
  registrarDebug("Parâmetros recebidos", `id=${id || "vazio"} tipo=${tipo}`);

  if (!conteudo) {
    registrarDebug("Elemento #conteudo não encontrado");
    return;
  }

  if (!id) {
    mostrarErro("ID inválido.");
    return;
  }

  try {
    const colecoes =
      tipo === "evento"
        ? ["eventos", "anuncios"]
        : ["anuncios", "eventos"];

    registrarDebug("Coleções para consulta", colecoes.join(", "));

    let snapshotEncontrado = null;
    let colecaoUsada = "";

    for (const colecao of colecoes) {
      registrarDebug("Consultando Firestore", `${colecao}/${id}`);

      const referencia = doc(db, colecao, id);
      const snapshot = await getDoc(referencia);

      registrarDebug(
        "Resposta Firestore",
        `${colecao}/${id} exists=${snapshot.exists()}`
      );

      if (snapshot.exists()) {
        snapshotEncontrado = snapshot;
        colecaoUsada = colecao;
        break;
      }
    }

    if (!snapshotEncontrado) {
      mostrarErro("Conteúdo não encontrado.");
      return;
    }

    renderizar({
      id: snapshotEncontrado.id,
      ...snapshotEncontrado.data()
    }, colecaoUsada);

  } catch (erro) {
    console.error("Erro detalhe:", erro);
    registrarDebug("Erro capturado", erro?.message || String(erro));
    mostrarErro("Erro ao carregar detalhe.", erro?.stack || erro?.message || String(erro));
  }
}

carregar();
