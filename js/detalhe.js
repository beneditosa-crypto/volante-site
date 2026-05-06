```javascript
import { db } from "./firebase.js";
import { baixarApp } from "./shared.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.baixarApp = baixarApp;

const conteudo = document.getElementById("conteudo");

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

async function carregarDetalhe() {
  if (!id) {
    conteudo.innerHTML = `
      <div class="loading">
        Item não encontrado.
      </div>
    `;

    return;
  }

  try {
    const anuncioRef = doc(db, "anuncios", id);

    const anuncioSnap = await getDoc(anuncioRef);

    if (!anuncioSnap.exists()) {
      conteudo.innerHTML = `
        <div class="loading">
          Item não encontrado.
        </div>
      `;

      return;
    }

    const item = {
      id: anuncioSnap.id,
      ...anuncioSnap.data(),
    };

    renderizar(item);
  } catch (error) {
    console.error(error);

    conteudo.innerHTML = `
      <div class="loading">
        Erro ao carregar detalhe.
      </div>
    `;
  }
}

function formatarPreco(valor) {
  if (!valor) return "";

  if (typeof valor === "string" && valor.includes("R$")) {
    return valor;
  }

  const numero = Number(String(valor).replace(/\D/g, ""));

  if (isNaN(numero)) {
    return valor;
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
```
