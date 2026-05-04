import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
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

let itens = [];
let selecionado = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/admin/login.html";
    return;
  }

  document.getElementById("email").innerText = user.email;
  carregar();
});

window.logout = async function () {
  await signOut(auth);
  window.location.href = "/admin/login.html";
};

async function carregar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const anuncios = await getDocs(collection(db, "anuncios"));
  const eventos = await getDocs(collection(db, "eventos"));

  itens = [];

  anuncios.forEach(d => itens.push({ ...d.data(), id: d.id, tipo: "Anúncio" }));
  eventos.forEach(d => itens.push({ ...d.data(), id: d.id, tipo: "Evento" }));

  itens.forEach((item, i) => {
    const foto = item.fotos?.[0] || item.imagem || "";

    lista.innerHTML += `
      <tr>
        <td>${foto ? `<img src="${foto}" width="60">` : ""}</td>
        <td>${item.tipo}</td>
        <td>${item.status}</td>
        <td>${item.titulo}</td>
        <td>${item.usuarioEmail || "-"}</td>
        <td>
          <button onclick="aprovar(${i})">OK</button>
          <button onclick="abrir(${i})">Devolver</button>
        </td>
      </tr>
    `;
  });
}

window.aprovar = async function (i) {
  const item = itens[i];

  await updateDoc(doc(db, item.tipo === "Anúncio" ? "anuncios" : "eventos", item.id), {
    status: "ATIVO"
  });

  carregar();
};

window.abrir = function (i) {
  selecionado = itens[i];
  document.getElementById("modal").classList.remove("hidden");
};

window.fechar = function () {
  document.getElementById("modal").classList.add("hidden");
};

window.confirmar = async function () {
  const motivo = document.getElementById("motivo").value;

  await updateDoc(doc(db, selecionado.tipo === "Anúncio" ? "anuncios" : "eventos", selecionado.id), {
    status: "RECUSADO",
    motivo
  });

  fechar();
  carregar();
};
