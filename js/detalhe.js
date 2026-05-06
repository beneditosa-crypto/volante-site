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

let fotosGaleria = [];
let fotoAtual = 0;
let inicioToqueX = 0;

async function carregarDetalhe() {
  if (!id) {
    conteudo.innerHTML = `<div class="loading">Item não encontrado.</div>`;
    return;
  }

  try {
    const anuncioRef = doc(db, "anuncios", id);
    const anuncioSnap = await getDoc(anuncioRef);

    if (!anuncioSnap.exists()) {
      conteudo.innerHTML = `<div class="loading">Item não encontrado.</div>`;
      return;
    }

    const item = {
      id: anuncioSnap.id,
      ...anuncioSnap.data(),
    };

    renderizar(item);
  } catch (error) {
    console.error(error);
    conteudo.innerHTML = `<div class="loading">Erro ao carregar detalhe.</div>`;
  }
}

function formatarPreco(valor) {
  if (valor === undefined || valor === null || valor === "") return "";

  if (typeof valor === "string" && valor.trim().includes("R$")) {
    return valor;
  }

  let numero;

  if (typeof valor === "number") {
    numero = valor;
  } else {
    const limpo = String(valor)
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".");

    numero = Number(limpo);
  }

  if (Number.isNaN(numero)) return "";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function escaparTexto(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderizar(item) {
  fotosGaleria =
    item.fotos && item.fotos.length
      ? item.fotos
      : item.imagem
      ? [item.imagem]
      : ["https://placehold.co/1200x900?text=Volante"];

  fotoAtual = 0;

  const titulo = escaparTexto(item.titulo || "Veículo anunciado");
  const preco = formatarPreco(item.preco);
  const cidade = escaparTexto(item.cidade || "");
  const estado = escaparTexto(item.estado || "");
  const descricao = escaparTexto(item.descricao || "Sem descrição.");
  const tipo = item.tipo === "EVENTO" ? "Evento" : "Anúncio";

  const urlAtual = window.location.href;
  const textoCompartilhar = `${item.titulo || "Veículo anunciado"} no Volante App`;

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    textoCompartilhar + " " + urlAtual
  )}`;

  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    urlAtual
  )}`;

  const email = `mailto:?subject=${encodeURIComponent(
    textoCompartilhar
  )}&body=${encodeURIComponent(urlAtual)}`;

  conteudo.innerHTML = `
    <section class="detalhe">
      <div class="galeria">
        <div class="foto-principal-wrap" id="fotoWrap">
          <button class="seta-foto seta-foto-esquerda" id="fotoAnterior" aria-label="Foto anterior">
            ‹
          </button>

          <img
            id="fotoPrincipal"
            class="foto-principal"
            src="${fotosGaleria[0]}"
            alt="${titulo}"
          />

          <button class="seta-foto seta-foto-direita" id="fotoProxima" aria-label="Próxima foto">
            ›
          </button>

          <div class="tipo-badge">
            ${tipo}
          </div>
        </div>

        <div class="miniaturas">
          ${fotosGaleria
            .map(
              (foto, index) => `
                <img
                  class="miniatura ${index === 0 ? "ativa" : ""}"
                  src="${foto}"
                  alt="${titulo}"
                  data-index="${index}"
                />
              `
            )
            .join("")}
        </div>
      </div>

      <div class="painel">
        <h1 class="titulo">${titulo}</h1>

        <div class="meta">
          ${cidade}${estado ? ` • ${estado}` : ""}
        </div>

        ${
          preco
            ? `
              <div class="preco">
                ${preco}
              </div>
            `
            : ""
        }

        <div class="descricao">
          <h3>Descrição</h3>
          <p>${descricao}</p>
        </div>

        <div class="cta-app">
          <h3>Aplicativo disponível nas lojas</h3>

          <p>
            Converse com anunciantes, publique veículos, favorite anúncios
            e acesse todos os recursos pelo aplicativo Volante.
          </p>

          <div class="app-store-box">
            <a class="app-store-btn" href="#" onclick="baixarApp(); return false;">
              Google Play
            </a>

            <a class="app-store-btn" href="#" onclick="baixarApp(); return false;">
              App Store
            </a>
          </div>
        </div>

        <div class="compartilhar">
          <div class="bloco">
            <h3>Compartilhar</h3>

            <p>
              Envie este anúncio para amigos e grupos.
            </p>

            <div class="share-grid">
              <a class="share-btn share-whatsapp" href="${whatsapp}" target="_blank">
                WhatsApp
              </a>

              <a class="share-btn share-email" href="${email}">
                Email
              </a>

              <a class="share-btn share-facebook" href="${facebook}" target="_blank">
                Facebook
              </a>
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

  fotoPrincipal.src = fotosGaleria[fotoAtual];

  document.querySelectorAll(".miniatura").forEach((miniatura, i) => {
    miniatura.classList.toggle("ativa", i === fotoAtual);
  });
}

function fotoAnterior() {
  const novoIndex =
    fotoAtual === 0
      ? fotosGaleria.length - 1
      : fotoAtual - 1;

  atualizarFoto(novoIndex);
}

function proximaFoto() {
  const novoIndex =
    fotoAtual === fotosGaleria.length - 1
      ? 0
      : fotoAtual + 1;

  atualizarFoto(novoIndex);
}

function iniciarGaleria() {
  const fotoWrap = document.getElementById("fotoWrap");
  const botaoAnterior = document.getElementById("fotoAnterior");
  const botaoProxima = document.getElementById("fotoProxima");
  const miniaturas = document.querySelectorAll(".miniatura");

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

  fotoWrap.addEventListener("click", (event) => {
    const largura = fotoWrap.offsetWidth;
    const posicaoX = event.offsetX;

    if (posicaoX > largura / 2) {
      proximaFoto();
    } else {
      fotoAnterior();
    }
  });

  fotoWrap.addEventListener("touchstart", (event) => {
    inicioToqueX = event.touches[0].clientX;
  });

  fotoWrap.addEventListener("touchend", (event) => {
    const fimToqueX = event.changedTouches[0].clientX;
    const diferenca = inicioToqueX - fimToqueX;

    if (Math.abs(diferenca) < 40) return;

    if (diferenca > 0) {
      proximaFoto();
    } else {
      fotoAnterior();
    }
  });

  miniaturas.forEach((miniatura) => {
    miniatura.addEventListener("click", (event) => {
      event.stopPropagation();

      atualizarFoto(Number(miniatura.dataset.index));
    });
  });
}

carregarDetalhe();
