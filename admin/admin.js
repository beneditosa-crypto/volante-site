import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
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

let itens = [];
let itemSelecionado = null;

const loginEl = document.getElementById("login");
const painelEl = document.getElementById("painel");
const listaEl = document.getElementById("lista");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    mostrarLogin();
    return;
  }

  if ((user.email || "").trim().toLowerCase() !== ADMIN_EMAIL) {
    await signOut(auth);
    alert("Acesso negado.");
    mostrarLogin();
    return;
  }

  mostrarPainel(user.email);
  carregar();
});

function mostrarLogin() {
  painelEl.classList.add("hidden");
  loginEl.classList.remove("hidden");
}

function mostrarPainel(email) {
  loginEl.classList.add("hidden");
  painelEl.classList.remove("hidden");
  document.getElementById("adminEmail").innerText = email || "Volante App";
}

window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    alert("Informe email e senha.");
    return;
  }

  if (email.toLowerCase() !== ADMIN_EMAIL) {
    alert("Acesso permitido somente ao administrador.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível entrar. Verifique email e senha.");
  }
};

window.logout = async function () {
  await signOut(auth);
  mostrarLogin();
};

async function buscarColecao(nomeColecao, tipo) {
  const snapshot = await getDocs(collection(db, nomeColecao));

  return snapshot.docs.map((documento) => ({
    id: documento.id,
    colecao: nomeColecao,
    tipo,
    dados: documento.data()
  }));
}

window.carregar = async function () {
  listaEl.innerHTML = `
    <tr>
      <td colspan="6" class="mensagem">Carregando...</td>
    </tr>
  `;

  try {
    const [anuncios, eventos] = await Promise.all([
      buscarColecao("anuncios", "Anúncio"),
      buscarColecao("eventos", "Evento")
    ]);

    itens = [...anuncios, ...eventos]
      .filter((item) => (item.dados.status || "").toUpperCase() !== "EXCLUIDO")
      .sort((a, b) => {
        const dataA =
          a.dados.atualizadoEm?.seconds ||
          a.dados.criadoEm?.seconds ||
          a.dados.createdAt?.seconds ||
          0;

        const dataB =
          b.dados.atualizadoEm?.seconds ||
          b.dados.criadoEm?.seconds ||
          b.dados.createdAt?.seconds ||
          0;

        return dataB - dataA;
      });

    renderizar();
  } catch (erro) {
    console.error(erro);

    listaEl.innerHTML = `
      <tr>
        <td colspan="6" class="erro">Erro ao carregar dados do Firebase.</td>
      </tr>
    `;
  }
};

function renderizar() {
  document.getElementById("totalItens").innerText = itens.length;

  document.getElementById("totalPendentes").innerText =
    itens.filter((item) => (item.dados.status || "").toUpperCase() === "PENDENTE").length;

  document.getElementById("totalAnuncios").innerText =
    itens.filter((item) => item.tipo === "Anúncio").length;

  document.getElementById("totalEventos").innerText =
    itens.filter((item) => item.tipo === "Evento").length;

  if (!itens.length) {
    listaEl.innerHTML = `
      <tr>
        <td colspan="6" class="mensagem">Nenhum item encontrado.</td>
      </tr>
    `;
    return;
  }

  listaEl.innerHTML = "";

  itens.forEach((item, index) => {
    const foto = primeiraFoto(item);
    const titulo = tituloItem(item);
    const usuario = usuarioItem(item);
    const status = item.dados.status || "PENDENTE";
    const local = localItem(item);

    listaEl.innerHTML += `
      <tr>
        <td>
          ${
            foto
              ? `<img class="preview" src="${escapar(foto)}" alt="Foto">`
              : `<div class="sem-foto">sem foto</div>`
          }
        </td>

        <td>
          <span class="tag tipo">${item.tipo}</span>
        </td>

        <td>
          <span class="tag ${statusClass(status)}">${escapar(status)}</span>
        </td>

        <td>
          <div class="titulo-item">${escapar(titulo)}</div>
          ${local ? `<div class="subinfo">${escapar(local)}</div>` : ""}
        </td>

        <td>
          <div class="usuario">${escapar(usuario)}</div>
        </td>

        <td>
          <div class="acoes">
            <button class="btn-detalhar" onclick="detalhar(${index})">Detalhar</button>
            <button class="btn-aprovar" onclick="aprovar(${index})">Aprovar</button>
            <button class="btn-devolver" onclick="abrirModalDevolver(${index})">Devolver</button>
            <button class="btn-excluir" onclick="excluirItem(${index})">Excluir</button>
          </div>
        </td>
      </tr>
    `;
  });
}

window.aprovar = async function (index) {
  const item = itens[index];

  if (!item) return;

  const confirmar = window.confirm(
    `Aprovar ${item.tipo.toLowerCase()} "${tituloItem(item)}"?`
  );

  if (!confirmar) return;

  try {
    await updateDoc(doc(db, item.colecao, item.id), {
      status: "ATIVO",
      motivoDevolucao: "",
      observacaoAdmin: "",
      atualizadoEm: serverTimestamp()
    });

    await carregar();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao aprovar item.");
  }
};

window.abrirModalDevolver = function (index) {
  itemSelecionado = itens[index];

  if (!itemSelecionado) return;

  document.getElementById("devolverTitulo").innerText =
    `${itemSelecionado.tipo}: ${tituloItem(itemSelecionado)}`;

  document.getElementById("motivo").value =
    itemSelecionado.dados.motivoDevolucao ||
    itemSelecionado.dados.observacaoAdmin ||
    "";

  document.getElementById("modalDevolver").classList.remove("hidden");
};

window.fecharModalDevolver = function () {
  itemSelecionado = null;
  document.getElementById("modalDevolver").classList.add("hidden");
  document.getElementById("motivo").value = "";
};

window.confirmarDevolucao = async function () {
  const motivo = document.getElementById("motivo").value.trim();

  if (!itemSelecionado) return;

  if (!motivo) {
    alert("Informe o motivo da devolução.");
    return;
  }

  try {
    await updateDoc(doc(db, itemSelecionado.colecao, itemSelecionado.id), {
      status: "RECUSADO",
      motivoDevolucao: motivo,
      observacaoAdmin: motivo,
      atualizadoEm: serverTimestamp()
    });

    fecharModalDevolver();
    await carregar();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao devolver item.");
  }
};

window.excluirItem = async function (index) {
  const item = itens[index];

  if (!item) return;

  const confirmar = window.confirm(
    `Excluir ${item.tipo.toLowerCase()} "${tituloItem(item)}"?`
  );

  if (!confirmar) return;

  try {
    await updateDoc(doc(db, item.colecao, item.id), {
      status: "EXCLUIDO",
      atualizadoEm: serverTimestamp()
    });

    await carregar();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao excluir item.");
  }
};

window.detalhar = function (index) {
  const item = itens[index];

  if (!item) return;

  const d = item.dados;

  const fotos =
    item.tipo === "Anúncio"
      ? d.fotos || []
      : [d.imagem || d.foto].filter(Boolean);

  const fotosHtml = fotos.length
    ? `
      <div class="detalhe-fotos">
        ${fotos.map((foto) => `<img src="${escapar(foto)}" alt="Foto">`).join("")}
      </div>
    `
    : "";

  document.getElementById("detalheConteudo").innerHTML = `
    ${fotosHtml}

    <div class="detalhe-grid">
      <div><strong>Tipo</strong>${escapar(item.tipo)}</div>
      <div><strong>Status</strong>${escapar(d.status || "PENDENTE")}</div>
      <div><strong>Título</strong>${escapar(tituloItem(item))}</div>
      <div><strong>Usuário</strong>${escapar(usuarioItem(item))}</div>
      <div><strong>Cidade/Estado</strong>${escapar(localItem(item) || "-")}</div>
      <div><strong>Marca</strong>${escapar(d.marca || "-")}</div>
      <div><strong>Modelo</strong>${escapar(d.modelo || "-")}</div>
      <div><strong>Ano</strong>${escapar(d.ano || d.anoFabricacao || "-")}</div>
      <div><strong>Preço</strong>${escapar(d.preco || "-")}</div>
      <div><strong>Telefone</strong>${escapar(d.telefone || d.whatsapp || "-")}</div>
      <div><strong>Descrição</strong>${escapar(d.descricao || d.observacoes || "-")}</div>
      <div><strong>Motivo/Observação Admin</strong>${escapar(d.motivoDevolucao || d.observacaoAdmin || "-")}</div>
    </div>
  `;

  document.getElementById("modalDetalhe").classList.remove("hidden");
};

window.fecharModalDetalhe = function () {
  document.getElementById("modalDetalhe").classList.add("hidden");
  document.getElementById("detalheConteudo").innerHTML = "";
};

function primeiraFoto(item) {
  const d = item.dados;

  if (item.tipo === "Anúncio") {
    return d.fotos?.[0] || d.foto || d.imagem || "";
  }

  return d.imagem || d.foto || d.fotos?.[0] || "";
}

function tituloItem(item) {
  return item.dados.titulo || item.dados.nome || "Sem título";
}

function usuarioItem(item) {
  return (
    item.dados.usuarioEmail ||
    item.dados.emailUsuario ||
    item.dados.email ||
    item.dados.criadoPor ||
    item.dados.userEmail ||
    "-"
  );
}

function localItem(item) {
  const cidade = item.dados.cidade || "";
  const estado = item.dados.estado || "";

  return `${cidade} ${estado}`.trim();
}

function statusClass(status) {
  const s = (status || "").toUpperCase();

  if (s === "ATIVO") return "status-ativo";
  if (s === "PENDENTE") return "status-pendente";
  if (s === "RECUSADO" || s === "DEVOLVIDO") return "status-recusado";
  if (s === "EXCLUIDO") return "status-excluido";

  return "status-pendente";
}

function escapar(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
