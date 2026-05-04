import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
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

const ADMIN = "admin@clube.com";

let itemSelecionado = null;
let itens = [];

window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (email !== ADMIN) {
    alert("Acesso negado");
    return;
  }

  await signInWithEmailAndPassword(auth, email, senha);

  document.getElementById("login").classList.add("hidden");
  document.getElementById("painel").classList.remove("hidden");

  carregar();
};

window.logout = async function () {
  await signOut(auth);
  location.reload();
};

window.carregar = async function () {
  const lista = document.getElementById("lista");
  lista.innerHTML = "Carregando...";

  const anuncios = await getDocs(collection(db, "anuncios"));
  const eventos = await getDocs(collection(db, "eventos"));

  itens = [];

  anuncios.forEach(doc => {
    itens.push({ ...doc.data(), id: doc.id, tipo: "Anúncio" });
  });

  eventos.forEach(doc => {
    itens.push({ ...doc.data(), id: doc.id, tipo: "Evento" });
  });

  lista.innerHTML = "";

  itens.forEach((item, i) => {
    const foto = item.fotos?.[0] || item.imagem || "";

    lista.innerHTML += `
      <tr>
        <td>${foto ? `<img class="preview" src="${foto}">` : ""}</td>
        <td>${item.tipo}</td>
        <td>${item.status}</td>
        <td>${item.titulo}</td>
        <td>${item.usuarioEmail || "-"}</td>
        <td>
          <button onclick="abrirModal(${i})">Devolver</button>
        </td>
      </tr>
    `;
  });
};

window.abrirModal = function (index) {
  itemSelecionado = itens[index];
  document.getElementById("modal").classList.remove("hidden");
};

window.fecharModal = function () {
  document.getElementById("modal").classList.add("hidden");
};

window.confirmarDevolucao = function () {
  const motivo = document.getElementById("motivo").value;

  if (!motivo) {
    alert("Informe o motivo");
    return;
  }

  alert("Motivo salvo: " + motivo);

  fecharModal();
};
