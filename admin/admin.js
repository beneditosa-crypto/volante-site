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
  appId: "1:559157035885:web:55b0d3c5d7d7f2d7b7c000",
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

btnAtualizar.addEventListener("click", async () => {
  await carregar();
});

btnSair.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./login.html";
});

document.querySelectorAll(".filtro").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    filtroAtual = btn.dataset.status || "TODOS";
    render();
  });
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
    <div class="card-resumo"><span>Total</span><strong>${dados.length}</strong></div>
    <div class="card-resumo"><span>Pendentes</span><strong>${contar("PENDENTE")}</strong></div>
    <div class="card-resumo"><span>Devolvidos</span><strong>${contar("DEVOLVIDO")}</strong></div>
    <div class="card-resumo"><span>Ativos</span><strong>${contar("ATIVO")}</strong></div>
    <div class="card-resumo"><span>Inativos</span><strong>${contar("INATIVO")}</strong></div>
  `;
}

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
    item.observação ||
    ""
  );

  const email = escapar(
    item.email ||
    item.usuarioEmail ||
    item.criadorEmail ||
    item.vendedorEmail ||
    item.userEmail ||
    "Não informado"
  );

  const cidade = escapar(item.cidade || "");
  const estado = escapar(item.estado || "");
  const data = formatarData(item.criadoEm || item.createdAt || item.atualizadoEm || item.dataCriacao);

  return `
    <article class="item">
      <div class="col-tipo">
        <span class="tipo">${item.tipo}</span>
        <button class="status ${status}" onclick="filtrarStatus('${status}')">${status}</button>
      </div>

      <div class="info">
        <h3>${titulo}</h3>
        <p class="descricao">${descricao}</p>

        <div class="meta">
          <span><strong>Usuário:</strong> ${email}</span>
          <span><strong>Local:</strong> ${cidade}${cidade && estado ? " / " : ""}${estado}</span>
          <span><strong>Criado:</strong> ${data}</span>
        </div>
      </div>

      <div class="fotos">
        ${fotos.map((foto) => `<img src="${escapar(foto)}" alt="Foto" />`).join("")}
      </div>

      <div class="botoes">
        <button class="btn-aprovar" onclick="aprovar('${item.id}','${item.colecao}')">Aprovar</button>
        <button class="btn-devolver" onclick="devolver('${item.id}','${item.colecao}')">Devolver</button>
        <button class="btn-inativar" onclick="inativar('${item.id}','${item.colecao}')">Inativar</button>
        <button class="btn-excluir" onclick="excluirDaBase('${item.id}','${item.colecao}')">Excluir</button>
      </div>
    </article>
  `;
}

window.filtrarStatus = function (status) {
  filtroAtual = status;

  document.querySelectorAll(".filtro").forEach((b) => {
    b.classList.toggle("ativo", b.dataset.status === status);
  });

  render();
};

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
  const confirmar = confirm("Excluir definitivamente da base? Esta ação não pode ser desfeita.");

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

  let d;

  if (data.seconds) {
    d = new Date(data.seconds * 1000);
  } else {
    d = new Date(data);
  }

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
