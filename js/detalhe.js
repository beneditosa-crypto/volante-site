import { db } from "./firebase.js";

import {
  baixarApp,
  escapeHtml,
  formatarPreco,
  getFotos,
  textoLocal,
  atualizarMetaDetalhe
} from "./shared.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.baixarApp = baixarApp;

const conteudo = document.getElementById("conteudo");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const tipoParam = (params.get("tipo") || "anuncio").toLowerCase();

let fotosGaleria = [];
let fotoAtual = 0;
let inicioToqueX = 0;

async function carregarDetalhe() {
  if (!id) {
    conteudo.innerHTML = `<div class="empty">Item não encontrado.</div>`;
    return;
  }

  try {
    const colecaoPrincipal = tipoParam === "evento" ? "eventos" : "anuncios";
    const colecaoFallback = tipoParam === "evento" ? "anuncios" : "eventos";

    let itemSnap = await getDoc(doc(db, colecaoPrincipal, id));
    let colecaoUsada = colecaoPrincipal;

    if (!itemSnap.exists()) {
      itemSnap = await getDoc(doc(db, colecaoFallback, id));
      colecaoUsada = colecaoFallback;
    }

    if (!itemSnap.exists()) {
      conteudo.innerHTML = `<div class="empty">Item não encontrado.</div>`;
      return;
    }

    const item = {
      id: itemSnap.id,
      tipoColecao: colecaoUsada,
      ...itemSnap.data()
    };

    renderizar(item);
  } catch (error) {
    console.error(error);
    conteudo.innerHTML = `<div class="empty">Erro ao carregar detalhe.</div>`;
  }
}

function renderizar(item) {
  fotosGaleria = getFotos(item);
  fotoAtual = 0;

  const tituloOriginal = item.titulo || item.nome || "Item Volante";
  const titulo = escapeHtml(tituloOriginal);
  const preco = formatarPreco(item.preco);
  const local = escapeHtml(textoLocal(item));
  const descricaoOriginal = item.descricao || "Sem descrição.";
  const descricao = escapeHtml(descricaoOriginal);
  const ehEvento = item.tipoColecao === "eventos" || item.tipo === "EVENTO";
  const tipo = ehEvento ? "Evento" : "Anúncio";
  const urlAtual = window.location.href;
  const imagemPrincipal = fotosGaleria[0];

  atualizarMetaDetalhe({
    titulo: tituloOriginal,
    descricao: descricaoOriginal,
    imagem: imagemPrincipal,
    url: urlAtual
  });

  const textoCompartilhar = `${tituloOriginal} no Volante App`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(textoCompartilhar + " " + urlAtual)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlAtual)}`;
  const email = `mailto:?subject=${encodeURIComponent(textoCompartilhar)}&body=${encodeURIComponent(urlAtual)}`;

  conteudo.innerHTML = `
    <section class="detalhe">
      <div class="galeria">
        <div class="foto-principal-wrap" id="fotoWrap">
          <button class="seta-foto seta-foto-esquerda" id="fotoAnterior" aria-label="Foto anterior">‹</button>
          <img id="fotoPrincipal" class="foto-principal" src="${imagemPrincipal}" alt="${titulo}" />
          <button class="seta-foto seta-foto-direita" id="fotoProxima" aria-label="Próxima foto">›</button>
          <div class="tipo-badge">${tipo}</div>
        </div>

        <div class="miniaturas">
          ${fotosGaleria.map((foto, index) => `
            <img class="miniatura ${index === 0 ? "ativa" : ""}" src="${foto}" alt="${titulo}" data-index="${index}" />
          `).join("")}
        </div>
      </div>

      <div class="painel">
        <h1 class="titulo">${titulo}</h1>
        <div class="meta">${local}</div>

        ${preco && !ehEvento ? `<div class="preco">${escapeHtml(preco)}</div>` : ""}

        <div class="descricao">
          <h3>Descrição</h3>
          <p>${descricao}</p>
        </div>

        <div class="cta-app">
          <h3>Aplicativo disponível nas lojas</h3>
          <p>Converse com anunciantes, publique veículos, favorite anúncios e acesse todos os recursos pelo aplicativo Volante.</p>

          <div class="app-store-box">
            <a class="app-store-btn" href="#" onclick="baixarApp(); return false;">Google Play</a>
            <a class="app-store-btn" href="#" onclick="baixarApp(); return false;">App Store</a>
          </div>
        </div>

        <div class="compartilhar">
          <div class="bloco">
            <h3>Compartilhar</h3>
            <p>Envie este ${ehEvento ? "evento" : "anúncio"} para amigos e grupos.</p>

            <div class="share-grid">
              <a class="share-btn" href="${whatsapp}" target="_blank" aria-label="Compartilhar no WhatsApp">W</a>
              <a class="share-btn" href="${email}" aria-label="Compartilhar por e-mail">@</a>
              <a class="share-btn" href="${facebook}" target="_blank" aria-label="Compartilhar no Facebook">f</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  iniciarGaleria();
}

function atualizarFoto(index) {
  fotoAtual = index;
  const fotoPrincipal = document.getElementById("fotoPrincipal");
  if (!fotoPrincipal) return;

  fotoPrincipal.src = fotosGaleria[fotoAtual];

  document.querySelectorAll(".miniatura").forEach((miniatura, i) => {
    miniatura.classList.toggle("ativa", i === fotoAtual);
  });
}

function fotoAnterior() {
  atualizarFoto(fotoAtual === 0 ? fotosGaleria.length - 1 : fotoAtual - 1);
}

function proximaFoto() {
  atualizarFoto(fotoAtual === fotosGaleria.length - 1 ? 0 : fotoAtual + 1);
}

function iniciarGaleria() {
  const fotoWrap = document.getElementById("fotoWrap");
  const botaoAnterior = document.getElementById("fotoAnterior");
  const botaoProxima = document.getElementById("fotoProxima");
  const miniaturas = document.querySelectorAll(".miniatura");

  if (!fotoWrap || !botaoAnterior || !botaoProxima) return;

  if (fotosGaleria.length <= 1) {
    botaoAnterior.style.display = "none";
    botaoProxima.style.display = "none";
  }

  botaoAnterior.addEventListener("click", (event) => {
    event.stopPropagation();
    fotoAnterior();
  });

  botaoProxima.addEventListener("click", (event) => {
    event.stopPropagation();
    proximaFoto();
  });

  fotoWrap.addEventListener("touchstart", (event) => {
    inicioToqueX = event.touches[0].clientX;
  });

  fotoWrap.addEventListener("touchend", (event) => {
    const fimToqueX = event.changedTouches[0].clientX;
    const diferenca = inicioToqueX - fimToqueX;

    if (Math.abs(diferenca) < 40) return;
    diferenca > 0 ? proximaFoto() : fotoAnterior();
  });

  miniaturas.forEach((miniatura) => {
    miniatura.addEventListener("click", (event) => {
      event.stopPropagation();
      atualizarFoto(Number(miniatura.dataset.index));
    });
  });
}

carregarDetalhe();
