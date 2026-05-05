import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9-eYhr2Bdadd4OWD17zIRszsz3LrxeBc",
  authDomain: "clube-da-caminhonete-be770.firebaseapp.com",
  projectId: "clube-da-caminhonete-be770",
  storageBucket: "clube-da-caminhonete-be770.firebasestorage.app",
  messagingSenderId: "559157035885",
  appId: "1:559157035885:web:55b0d3c5d7d7f2d7b7c000"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "admin@clube.com";

const lista = document.getElementById("lista");
const resumo = document.getElementById("resumo");
const btnAtualizar = document.getElementById("btnAtualizar");
const btnSair = document.getElementById("btnSair");

const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalConteudo = document.getElementById("modalConteudo");
const fecharModal = document.getElementById("fecharModal");

let itens = [];
let filtroAtual = "TODOS";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  if ((user.email || "").toLowerCase() !== ADMIN_EMAIL) {
    await signOut(auth);
    window.location.href = "./login.html";
    return;
  }

  carregarPainel();
});

btnAtualizar.addEventListener("click", carregarPainel);

btnSair.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./login.html";
});

fecharModal.addEventListener("click", fechar);
modal.addEventListener("click", (event) => {
  if (event.target === modal) fechar();
});

document.querySelectorAll(".filter").forEach((botao) => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    botao.classList.add("active");

    filtroAtual = botao.dataset.status;
    renderizar();
  });
});

async function carregarPainel() {
  lista.innerHTML = `<p class="empty">Carregando itens...</p>`;

  const anunciosSnap = await getDocs(collection(db, "anuncios"));
  const eventosSnap = await getDocs(collection(db, "eventos"));

  const anuncios = anunciosSnap.docs.map((d) => ({
    id: d.id,
    colecao: "anuncios",
    tipo: "ANÚNCIO",
    ...d.data()
  }));

  const eventos = eventosSnap.docs.map((d) => ({
    id: d.id,
    colecao: "eventos",
    tipo: "EVENTO",
    ...d.data()
  }));

  itens = [...anuncios, ...eventos];

  await inativarEventosPassados();

  itens.sort((a, b) => {
    const da = obterDataOrdenacao(a);
    const dbb = obterDataOrdenacao(b);
    return dbb - da;
  });

  renderizar();
}

async function inativarEventosPassados() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (const item of itens) {
    if (item.colecao !== "eventos") continue;
    if ((item.status || "").toUpperCase() !== "ATIVO") continue;

    const dataEvento = obterDataEvento(item);
    if (!dataEvento) continue;

    dataEvento.setHours(0, 0, 0, 0);

    if (dataEvento < hoje) {
      await updateDoc(doc(db, "eventos", item.id), {
        status: "INATIVO",
        inativadoAutomaticamente: true,
        motivoInativacao: "Evento já ocorrido"
      });

      item.status = "INATIVO";
      item.inativadoAutomaticamente = true;
      item.motivoInativacao = "Evento já ocorrido";
    }
  }
}

function renderizar() {
  renderizarResumo();

  const filtrados = itens.filter((item) => {
    const status = (item.status || "PENDENTE").toUpperCase();
    return filtroAtual === "TODOS" || status === filtroAtual;
  });

  if (!filtrados.length) {
    lista.innerHTML = `<p class="empty">Nenhum item encontrado.</p>`;
    return;
  }

  lista.innerHTML = filtrados.map((item) => cardHtml(item)).join("");

  filtrados.forEach((item) => {
    document.getElementById(`detalhar-${item.chave}`).addEventListener("click", () => detalhar(item));
    document.getElementById(`aprovar-${item.chave}`).addEventListener("click", () => aprovar(item));
    document.getElementById(`devolver-${item.chave}`).addEventListener("click", () => devolver(item));
    document.getElementById(`inativar-${item.chave}`).addEventListener("click", () => inativar(item));
    document.getElementById(`excluir-${item.chave}`).addEventListener("click", () => excluirDaBase(item));
  });
}

function cardHtml(item) {
  item.chave = `${item.colecao}-${item.id}`;

  const titulo = item.titulo || item.nome || "Sem título";
  const status = (item.status || "PENDENTE").toUpperCase();
  const cidade = item.cidade || "";
  const estado = item.estado || "";
  const email = item.email || item.usuarioEmail || item.criadorEmail || item.vendedorEmail || "Não informado";
  const dataEvento = item.colecao === "eventos" ? formatarData(obterDataEvento(item)) : "";

  return `
    <article class="card">
      <div class="card-header">
        <div class="badges">
          <span class="badge ${item.colecao === "anuncios" ? "anuncio" : "evento"}">${item.tipo}</span>
          <span class="badge status">${status}</span>
        </div>
      </div>

      <h3>${escapar(titulo)}</h3>

      <div class="meta">
        <div><strong>Usuário:</strong> ${escapar(email)}</div>
        <div><strong>Local:</strong> ${escapar(cidade)}${cidade && estado ? " / " : ""}${escapar(estado)}</div>
        ${dataEvento ? `<div><strong>Data do evento:</strong> ${dataEvento}</div>` : ""}
        ${item.motivoDevolucao ? `<div><strong>Motivo devolução:</strong> ${escapar(item.motivoDevolucao)}</div>` : ""}
      </div>

      <div class="actions">
        <button id="detalhar-${item.chave}" class="btn detail">Detalhar</button>
        <button id="aprovar-${item.chave}" class="btn approve">Aprovar</button>
        <button id="devolver-${item.chave}" class="btn return">Devolver</button>
        <button id="inativar-${item.chave}" class="btn inactive">Inativar</button>
        <button id="excluir-${item.chave}" class="btn danger">Excluir da base</button>
      </div>
    </article>
  `;
}

function renderizarResumo() {
  const total = itens.length;
  const pendentes = contar("PENDENTE");
  const devolvidos = contar("DEVOLVIDO");
  const ativos = contar("ATIVO");
  const inativos = contar("INATIVO");

  resumo.innerHTML = `
    <div class="summary-card">Total<strong>${total}</strong></div>
    <div class="summary-card">Pendentes<strong>${pendentes}</strong></div>
    <div class="summary-card">Devolvidos<strong>${devolvidos}</strong></div>
    <div class="summary-card">Ativos<strong>${ativos}</strong></div>
    <div class="summary-card">Inativos<strong>${inativos}</strong></div>
  `;
}

function contar(status) {
  return itens.filter((item) => (item.status || "PENDENTE").toUpperCase() === status).length;
}

async function aprovar(item) {
  if (!confirm(`Aprovar este ${item.tipo.toLowerCase()}?`)) return;

  await updateDoc(doc(db, item.colecao, item.id), {
    status: "ATIVO",
    motivoDevolucao: "",
    motivoInativacao: ""
  });

  await carregarPainel();
}

function devolver(item) {
  modalTitulo.textContent = `Devolver ${item.tipo.toLowerCase()}`;

  modalConteudo.innerHTML = `
    <p>Informe o motivo da devolução. O criador deverá corrigir e enviar novamente para análise.</p>
    <textarea id="motivoDevolucao" placeholder="Ex: Fotos insuficientes, informações incompletas, preço ausente..."></textarea>
    <button id="confirmarDevolucao" class="btn return">Confirmar devolução</button>
  `;

  abrir();

  document.getElementById("confirmarDevolucao").addEventListener("click", async () => {
    const motivo = document.getElementById("motivoDevolucao").value.trim();

    if (!motivo) {
      alert("Informe o motivo da devolução.");
      return;
    }

    await updateDoc(doc(db, item.colecao, item.id), {
      status: "DEVOLVIDO",
      motivoDevolucao: motivo
    });

    fechar();
    await carregarPainel();
  });
}

async function inativar(item) {
  const motivo = prompt(`Motivo para inativar este ${item.tipo.toLowerCase()}?`);

  if (motivo === null) return;

  await updateDoc(doc(db, item.colecao, item.id), {
    status: "INATIVO",
    motivoInativacao: motivo.trim() || "Inativado pelo administrador"
  });

  await carregarPainel();
}

async function excluirDaBase(item) {
  const titulo = item.titulo || item.nome || "sem título";

  const confirmar = confirm(
    `ATENÇÃO: isso vai excluir definitivamente da base.\n\n${item.tipo}: ${titulo}\n\nDeseja continuar?`
  );

  if (!confirmar) return;

  await deleteDoc(doc(db, item.colecao, item.id));
  await carregarPainel();
}

function detalhar(item) {
  modalTitulo.textContent = `${item.tipo} - detalhes`;

  const fotos = Array.isArray(item.fotos) ? item.fotos : [];

  modalConteudo.innerHTML = `
    ${fotos.length ? `
      <div class="fotos">
        ${fotos.map((foto) => `<img src="${foto}" alt="Imagem" />`).join("")}
      </div>
    ` : ""}

    <div class="detail-grid">
      ${Object.entries(item)
        .filter(([chave]) => !["chave"].includes(chave))
        .map(([chave, valor]) => `
          <div class="detail-row">
            <strong>${escapar(chave)}:</strong><br />
            ${escapar(formatarValor(valor))}
          </div>
        `).join("")}
    </div>
  `;

  abrir();
}

function abrir() {
  modal.classList.remove("hidden");
}

function fechar() {
  modal.classList.add("hidden");
  modalConteudo.innerHTML = "";
}

function obterDataOrdenacao(item) {
  if (item.criadoEm?.seconds) return item.criadoEm.seconds * 1000;
  if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
  if (item.atualizadoEm?.seconds) return item.atualizadoEm.seconds * 1000;

  const dataEvento = obterDataEvento(item);
  if (dataEvento) return dataEvento.getTime();

  return 0;
}

function obterDataEvento(item) {
  const valor = item.dataEvento || item.data || item.dataInicio || item.dia;

  if (!valor) return null;

  if (valor.seconds) return new Date(valor.seconds * 1000);

  const data = new Date(valor);
  return isNaN(data.getTime()) ? null : data;
}

function formatarData(data) {
  if (!data) return "";
  return data.toLocaleDateString("pt-BR");
}

function formatarValor(valor) {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "object") return JSON.stringify(valor, null, 2);
  return String(valor);
}

function escapar(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
