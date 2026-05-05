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

  if ((user.email || "").toLowerCase() !== ADMIN_EMAIL) {
    await signOut(auth);
    window.location.href = "./login.html";
    return;
  }

  carregar();
});

btnAtualizar.onclick = carregar;

btnSair.onclick = async () => {
  await signOut(auth);
  window.location.href = "./login.html";
};

document.querySelectorAll(".filtro").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    filtroAtual = btn.dataset.status;
    render();
  };
});

async function carregar() {
  const a = await getDocs(collection(db, "anuncios"));
  const e = await getDocs(collection(db, "eventos"));

  dados = [
    ...a.docs.map(d => ({...d.data(), id:d.id, tipo:"ANÚNCIO", colecao:"anuncios"})),
    ...e.docs.map(d => ({...d.data(), id:d.id, tipo:"EVENTO", colecao:"eventos"})),
  ];

  render();
}

function render() {
  renderResumo();

  const filtrados = dados.filter(i => {
    const s = (i.status || "PENDENTE").toUpperCase();
    return filtroAtual === "TODOS" || s === filtroAtual;
  });

  lista.innerHTML = filtrados.map(card).join("");
}

function renderResumo(){
  resumo.innerHTML = `
    <div class="card-resumo">Total<br><strong>${dados.length}</strong></div>
    <div class="card-resumo">Pendentes<br><strong>${contar("PENDENTE")}</strong></div>
    <div class="card-resumo">Devolvidos<br><strong>${contar("DEVOLVIDO")}</strong></div>
    <div class="card-resumo">Ativos<br><strong>${contar("ATIVO")}</strong></div>
    <div class="card-resumo">Inativos<br><strong>${contar("INATIVO")}</strong></div>
  `;
}

function contar(s){
  return dados.filter(i => (i.status||"PENDENTE").toUpperCase()===s).length;
}

function card(item){
  const fotos = item.fotos || [];

  return `
    <div class="item">

      <div class="info">
        <span class="tipo">${item.tipo}</span>

        <h3>${item.titulo}</h3>

        <div class="status-grande ${item.status}">
          ${item.status}
        </div>

        <p>${item.descricao || ""}</p>

        <p><strong>Usuário:</strong> ${item.email}</p>
        <p><strong>Local:</strong> ${item.cidade} / ${item.estado}</p>
        <p>${formatar(item.criadoEm)}</p>

        <div class="botoes">
          <button onclick="aprovar('${item.id}','${item.colecao}')">Aprovar</button>
          <button onclick="devolver('${item.id}','${item.colecao}')">Devolver</button>
          <button onclick="inativar('${item.id}','${item.colecao}')">Inativar</button>
          <button onclick="excluir('${item.id}','${item.colecao}')">Excluir da base</button>
        </div>
      </div>

      <div class="fotos">
        ${fotos.map(f => `<img src="${f}">`).join("")}
      </div>

    </div>
  `;
}

function formatar(ts){
  if(!ts?.seconds) return "";
  return new Date(ts.seconds*1000).toLocaleString("pt-BR");
}

window.aprovar = async (id,c)=>{
  await updateDoc(doc(db,c,id),{status:"ATIVO"});
  carregar();
}

window.devolver = async (id,c)=>{
  const m = prompt("Motivo:");
  if(!m) return;
  await updateDoc(doc(db,c,id),{status:"DEVOLVIDO",motivoDevolucao:m});
  carregar();
}

window.inativar = async (id,c)=>{
  await updateDoc(doc(db,c,id),{status:"INATIVO"});
  carregar();
}

window.excluir = async (id,c)=>{
  if(confirm("Excluir da base?")){
    await deleteDoc(doc(db,c,id));
    carregar();
  }
}
