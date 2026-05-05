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
    alert("Acesso restrito ao administrador.");
    await signOut(auth);
    window.location.href = "./login.html";
    return;
  }

  carregar();
});

btnAtualizar?.addEventListener("click", carregar);

btnSair?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./login.html";
});

document.querySelectorAll(".filtro").forEach((botao) => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    filtroAtual = botao.dataset.status || "TODOS";
    render();
  });
});

async function carregar() {
  lista.innerHTML = "<p>Carregando...</p>";

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

  dados.sort((a, b) => obterData(b) - obterData(a));

  render();
}

function render() {
  renderResumo();

  const filtrados = dados.filter((item) => {
    const status = (item.status || "PENDENTE").toUpperCase();
    return filtroAtual === "TODOS" || status === filtroAtual;
  });

  if (!filtrados.length) {
    lista.innerHTML = "<p>Nenhum item encontrado.</p>";
    return;
  }

  lista.innerHTML = filtrados.map(cardHTML).join("");
}

function renderResumo() {
  resumo.innerHTML = `
    <div class="card-resumo">Total<br><strong>${dados.length}</strong></div>
    <div class="card-resumo">Pendentes<br><strong>${contar("PENDENTE")}</strong></div>
    <div class="card-resumo">Devolvidos<br><strong>${contar("DEVOLVIDO")}</strong></div>
    <div class="card-resumo">Ativos<br><strong>${contar("ATIVO")}</strong></div>
    <div class="card-resumo">Inativos<br><strong>${contar("INATIVO")}</strong></div>
  `;
}

function contar(status) {
  return dados.filter((item) => (item.status || "PENDENTE").toUpperCase() === status).length;
}

function cardHTML(item) {
  const status = (item.status || "PENDENTE").toUpperCase();
  const fotos = Array.isArray(item.fotos) ? item.fotos : [];
  const titulo = item.titulo || item.nome || "Sem título";
  const email = item.email || item.usuarioEmail || item.criadorEmail || item.vendedorEmail || "";
  const cidade = item.cidade || "";
  const estado = item.estado || "";

  return `
    <div class="item">
      <div class="info">
        <span class="status ${status}">${item.tipo}</span>
        <span class="status ${status}">${status}</span>

        <h3>${escapar(titulo)}</h3>

        <p><strong>Usuário:</strong> ${escapar(email)}</p>
        <p><strong>Local:</strong> ${escapar(cidade)} / ${escapar(estado)}</p>
        <p><strong>Criado em:</strong> ${formatarData(item.criadoEm || item.createdAt || item.atualizadoEm)}</p>

        ${item.motivoDevolucao ? `<p><strong>Motivo:</strong> ${escapar(item.motivoDevolucao)}</p>` : ""}

        <div class="botoes">
          <button onclick="aprovar('${item.id}','${item.colecao}')">Aprovar</button>
          <button onclick="devolver('${item.id}','${item.colecao}')">Devolver</button>
          <button onclick="inativar('${item.id}','${item.colecao}')">Inativar</button>
          <button onclick="excluirDaBase('${item.id}','${item.colecao}')">Excluir da base</button>
        </div>
      </div>

      <div class="fotos">
        ${fotos.map((foto) => `<img src="${foto}" alt="Foto" />`).join("")}
      </div>
    </div>
  `;
}

window.aprovar = async function (id, colecao) {
  await updateDoc(doc(db, colecao, id), {
    status: "ATIVO",
    motivoDevolucao: "",
    motivoInativacao: "",
  });

  carregar();
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

  carregar();
};

window.inativar = async function (id, colecao) {
  const motivo = prompt("Motivo da inativação:");

  await updateDoc(doc(db, colecao, id), {
    status: "INATIVO",
    motivoInativacao: motivo?.trim() || "Inativado pelo administrador",
  });

  carregar();
};

window.excluirDaBase = async function (id, colecao) {
  const confirmar = confirm("Excluir definitivamente da base? Esta ação não pode ser desfeita.");

  if (!confirmar) return;

  await deleteDoc(doc(db, colecao, id));

  carregar();
};

function obterData(item) {
  const data = item.criadoEm || item.createdAt || item.atualizadoEm;

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
