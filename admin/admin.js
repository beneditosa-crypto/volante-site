import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9",
  authDomain: "clube-da-caminhonete-be770.firebaseapp.com",
  projectId: "clube-da-caminhonete-be770",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "admin@clube.com";

const lista = document.getElementById("lista");
const resumo = document.getElementById("resumo");

let dados = [];

onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    location.href = "./login.html";
    return;
  }
  carregar();
});

document.getElementById("btnAtualizar").onclick = carregar;

document.getElementById("btnSair").onclick = async () => {
  await signOut(auth);
  location.href = "./login.html";
};

async function carregar() {
  const a = await getDocs(collection(db, "anuncios"));
  const e = await getDocs(collection(db, "eventos"));

  dados = [
    ...a.docs.map(d => ({...d.data(), id:d.id, colecao:"anuncios", tipo:"ANÚNCIO"})),
    ...e.docs.map(d => ({...d.data(), id:d.id, colecao:"eventos", tipo:"EVENTO"}))
  ];

  dados.sort((a,b)=> getTime(b)-getTime(a));

  render();
}

function render() {
  lista.innerHTML = dados.map(i => linha(i)).join("");
}

function linha(i){
  return `
    <div class="linha">

      <div>${i.tipo}</div>

      <div class="status ${i.status}" onclick="filtrar('${i.status}')">
        ${i.status}
      </div>

      <div>${i.titulo}</div>

      <div>${i.descricao || ""}</div>

      <div>${i.email || ""}</div>

      <div>${i.cidade} / ${i.estado}</div>

      <div>${formatar(i.criadoEm)}</div>

      <div class="acoes">
        <button class="aprovar" onclick="aprovar('${i.id}','${i.colecao}')">Aprovar</button>
        <button class="devolver" onclick="devolver('${i.id}','${i.colecao}')">Devolver</button>
        <button class="inativar" onclick="inativar('${i.id}','${i.colecao}')">Inativar</button>
        <button class="excluir" onclick="excluir('${i.id}','${i.colecao}')">Excluir</button>
      </div>

      <div class="fotos">
        ${(i.fotos || []).map(f=>`<img src="${f}">`).join("")}
      </div>

    </div>
  `;
}

function getTime(i){
  return i.criadoEm?.seconds ? i.criadoEm.seconds*1000 : 0;
}

function formatar(t){
  if(!t?.seconds) return "";
  return new Date(t.seconds*1000).toLocaleString("pt-BR");
}

window.aprovar = async(id,c)=>{
  await updateDoc(doc(db,c,id),{status:"ATIVO"});
  carregar();
}

window.devolver = async(id,c)=>{
  const m = prompt("Motivo:");
  if(!m) return;
  await updateDoc(doc(db,c,id),{status:"DEVOLVIDO"});
  carregar();
}

window.inativar = async(id,c)=>{
  await updateDoc(doc(db,c,id),{status:"INATIVO"});
  carregar();
}

window.excluir = async(id,c)=>{
  if(confirm("Excluir?")){
    await deleteDoc(doc(db,c,id));
    carregar();
  }
}

window.filtrar = (s)=>{
  dados = dados.filter(i=>i.status===s);
  render();
}
