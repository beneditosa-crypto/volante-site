import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SEU_AUTH",
  projectId: "SEU_PROJECT",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const lista = document.getElementById("lista");
const resumo = document.getElementById("resumo");

let dados = [];

onAuthStateChanged(auth, (user) => {
  if (!user) location.href = "./login.html";
  carregar();
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
  lista.innerHTML = dados.map(item => `
    <div class="item">

      <div class="info">
        <div class="status ${item.status}">${item.tipo} - ${item.status}</div>
        <h3>${item.titulo}</h3>

        <p>Usuário: ${item.email}</p>
        <p>Local: ${item.cidade} / ${item.estado}</p>
        <p>${formatarData(item.criadoEm)}</p>

        <div class="botoes">
          <button onclick="aprovar('${item.id}','${item.colecao}')">Aprovar</button>
          <button onclick="devolver('${item.id}','${item.colecao}')">Devolver</button>
          <button onclick="inativar('${item.id}','${item.colecao}')">Inativar</button>
          <button onclick="excluir('${item.id}','${item.colecao}')">Excluir</button>
        </div>
      </div>

      <div class="fotos">
        ${item.fotos.map(f => `<img src="${f}"/>`).join("")}
      </div>

    </div>
  `).join("");
}

function formatarData(ts){
  if(!ts?.seconds) return "";
  const d = new Date(ts.seconds*1000);
  return d.toLocaleString("pt-BR");
}

window.aprovar = async (id,c) => {
  await updateDoc(doc(db,c,id),{status:"ATIVO"});
  carregar();
}

window.devolver = async (id,c) => {
  const motivo = prompt("Motivo:");
  if(!motivo) return;
  await updateDoc(doc(db,c,id),{status:"DEVOLVIDO",motivoDevolucao:motivo});
  carregar();
}

window.inativar = async (id,c) => {
  await updateDoc(doc(db,c,id),{status:"INATIVO"});
  carregar();
}

window.excluir = async (id,c) => {
  if(confirm("Excluir da base?")){
    await deleteDoc(doc(db,c,id));
    carregar();
  }
}

window.fecharModal = () => {
  document.getElementById("modal").classList.add("hidden");
}
