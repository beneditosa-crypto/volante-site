import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9-eYhr2Bdadd4OWD17zIRszsz3LrxeBc",
  authDomain: "clube-da-caminhonete-be770.firebaseapp.com",
  projectId: "clube-da-caminhonete-be770",
  storageBucket: "clube-da-caminhonete-be770.firebasestorage.app",
  messagingSenderId: "559157035885",
  appId: "1:559157035885:web:dd265c86d0a3db6a6b9064",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "admin@clube.com";

const lista = document.getElementById("lista");
const resumo = document.getElementById("resumo");
const btnAtualizar = document.getElementById("btnAtualizar");
const btnSair = document.getElementById("btnSair");

let dados = [];
let filtroAtual = "TODOS";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  const email = (user.email || "").trim().toLowerCase();

  if (email !== ADMIN_EMAIL) {
    await signOut(auth);
    window.location.href = "./login.html";
    return;
  }

  await carregar();
});

btnAtualizar.addEventListener("click", carregar);

btnSair.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./login.html";
});

async function carregar() {
  lista.innerHTML = `<div class="vazio">Atualizando painel...</div>`;

  const anunciosSnap = await getDocs(collection(db, "anuncios"));
  const eventosSnap = await getDocs(collection(db, "eventos"));

  dados = [
    ...anunciosSnap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      tipo: "ANÚNCIO",
      colecao: "anuncios",
    })),
    ...eventosSnap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      tipo: "EVENTO",
      colecao: "eventos",
    })),
  ];

  dados.sort((a, b) => obterTempo(b) - obterTempo(a));
  render();
}

function render() {
  renderResumo();

  const filtrados = dados.filter((item) => {
    const status = normalizarStatus(item.status);
    return filtroAtual === "TODOS" || status === filtroAtual;
  });

  if (!filtrados.length) {
    lista.innerHTML = `<div class="vazio">Nenhum item encontrado.</div>`;
    return;
  }

  lista.innerHTML = filtrados.map(card).join("");
}

function renderResumo() {
  resumo.innerHTML = `
    <button class="card-resumo TODOS ${filtroAtual === "TODOS" ? "ativo" : ""}" onclick="filtrarResumo('TODOS')">
      <span>Total</span><strong>${dados.length}</strong>
    </button>

    <button class="card-resumo PENDENTE ${filtroAtual === "PENDENTE" ? "ativo" : ""}" onclick="filtrarResumo('PENDENTE')">
      <span>Pendentes</span><strong>${contar("PENDENTE")}</strong>
    </button>

    <button class="card-resumo DEVOLVIDO ${filtroAtual === "DEVOLVIDO" ? "ativo" : ""}" onclick="filtrarResumo('DEVOLVIDO')">
      <span>Devolvidos</span><strong>${contar("DEVOLVIDO")}</strong>
    </button>

    <button class="card-resumo ATIVO ${filtroAtual === "ATIVO" ? "ativo" : ""}" onclick="filtrarResumo('ATIVO')">
      <span>Ativos</span><strong>${contar("ATIVO")}</strong>
    </button>

    <button class="card-resumo INATIVO ${filtroAtual === "INATIVO" ? "ativo" : ""}" onclick="filtrarResumo('INATIVO')">
      <span>Inativos</span><strong>${contar("INATIVO")}</strong>
    </button>
  `;
}

window.filtrarResumo = function (status) {
  filtroAtual = status;
  render();
};

function contar(status) {
  return dados.filter((item) => normalizarStatus(item.status) === status).length;
}

function card(item) {
  const status = normalizarStatus(item.status);
  const fotos = Array.isArray(item.fotos) ? item.fotos : [];

  const titulo = escapar(item.titulo || item.nome || "Sem título");

  const descricao = escapar(
    item.descricao ||
    item.descrição ||
    item.detalhes ||
    item.observacao ||
    item.texto ||
    ""
  );

  const email = escapar(
    item.email ||
    item.usuarioEmail ||
    item.criadorEmail ||
    item.vendedorEmail ||
    "Não informado"
  );

  const cidade = escapar(item.cidade || "");
  const estado = escapar(item.estado || "");
  const local = cidade || estado ? `${cidade}${cidade && estado ? " / " : ""}${estado}` : "";

  const data = formatarData(
    item.criadoEm ||
    item.createdAt ||
    item.atualizadoEm ||
    item.dataCriacao
  );

  return `
    <article class="item">
      <div><span class="tipo">${item.tipo}</span></div>
      <div class="titulo">${titulo}</div>
      <div class="descricao">${descricao}</div>
      <div class="usuario">${email}</div>
      <div class="local">${local}</div>
      <div class="data">${data}</div>
      <div><span class="status ${status}">${status}</span></div>

      <div class="botoes">
        <button class="btn-aprovar" onclick="aprovar('${item.id}','${item.colecao}')">OK</button>
        <button class="btn-devolver" onclick="devolver('${item.id}','${item.colecao}')">DEV</button>
        <button class="btn-inativar" onclick="inativar('${item.id}','${item.colecao}')">OFF</button>
        <button class="btn-excluir" onclick="excluirDaBase('${item.id}','${item.colecao}')">X</button>
      </div>

      <div class="fotos">
        ${fotos.map((foto) => `<img src="${escapar(foto)}" />`).join("")}
      </div>
    </article>
  `;
}

window.aprovar = async function (id, colecao) {
  await updateDoc(doc(db, colecao, id), {
    status: "ATIVO",
    motivoDevolucao: "",
    motivoInativacao: "",
  });

  await carregar();
};

window.devolver = async function (id, colecao) {
  const motivo = prompt("Informe o motivo da devolução:");

  if (!motivo || !motivo.trim()) {
    alert("O motivo da devolução é obrigatório.");
    return;
  }

  await updateDoc(doc(db, colecao, id), {
    status: "DEVOLVIDO",
    motivoDevolucao: motivo.trim(),
  });

  await carregar();
};

window.inativar = async function (id, colecao) {
  const motivo = prompt("Motivo da inativação:");

  await updateDoc(doc(db, colecao, id), {
    status: "INATIVO",
    motivoInativacao: motivo?.trim() || "Inativado pelo administrador",
  });

  await carregar();
};

window.excluirDaBase = async function (id, colecao) {
  const confirmar = confirm("Excluir definitivamente da base?");

  if (!confirmar) return;

  await deleteDoc(doc(db, colecao, id));
  await carregar();
};

function normalizarStatus(status) {
  const s = String(status || "PENDENTE").trim().toUpperCase();

  if (s === "RECUSADO") return "DEVOLVIDO";
  if (s === "APROVADO") return "ATIVO";
  if (s === "EXCLUIDO") return "INATIVO";

  return s;
}

function obterTempo(item) {
  const data = item.criadoEm || item.createdAt || item.atualizadoEm || item.dataCriacao;

  if (data?.seconds) return data.seconds * 1000;

  const tentativa = new Date(data);
  return isNaN(tentativa.getTime()) ? 0 : tentativa.getTime();
}

function formatarData(data) {
  if (!data) return "";

  const d = data.seconds ? new Date(data.seconds * 1000) : new Date(data);

  if (isNaN(d.getTime())) return "";

  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapar(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
