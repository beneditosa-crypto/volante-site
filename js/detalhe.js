
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyA9-eYhr2Bdadd4OWD17zIRszsz3LrxeBc",
authDomain: "clube-da-caminhonete-be770.firebaseapp.com",
projectId: "clube-da-caminhonete-be770",
storageBucket: "clube-da-caminhonete-be770.firebasestorage.app",
messagingSenderId: "559157035885",
appId: "1:559157035885:web:8d3c4c8d7c7c5f7b3b2a91"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);

const id = params.get("id");
const tipo = (params.get("tipo") || "anuncio").toLowerCase();

const conteudo = document.getElementById("conteudo");

function formatarPreco(valor){
if(!valor) return "";

if(String(valor).includes("R$")) return valor;

const numero = Number(String(valor).replace(/\D/g,""));

if(!numero) return "";

return numero.toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});
}

function textoLocal(item){
const cidade = item.cidade || "";
const estado = item.estado || item.uf || "";

if(cidade && estado){
return `${cidade} - ${estado}`;
}

return cidade || estado || "";
}

function getFotos(item){
if(Array.isArray(item.fotos) && item.fotos.length){
return item.fotos;
}

if(Array.isArray(item.imagens) && item.imagens.length){
return item.imagens;
}

if(item.foto) return [item.foto];
if(item.imagem) return [item.imagem];

return ["https://placehold.co/1200x900?text=Volante"];
}

async function carregar(){

try{

const colecao =
tipo === "evento"
? "eventos"
: "anuncios";

const ref = doc(db, colecao, id);

const snap = await getDoc(ref);

if(!snap.exists()){

conteudo.innerHTML = `
<div class="empty">
Conteúdo não encontrado.
</div>
`;

return;

}

const item = snap.data();

const fotos = getFotos(item);

const titulo =
item.titulo ||
item.nome ||
"Volante";

const local = textoLocal(item);

const preco = formatarPreco(item.preco);

conteudo.innerHTML = `
<section class="detalhe">

<div class="galeria">

<div class="foto-principal-wrap">

<img
class="foto-principal"
src="${fotos[0]}"
alt="${titulo}"
/>

<div class="tipo-badge">
${tipo === "evento" ? "EVENTO" : "ANÚNCIO"}
</div>

</div>

<div class="miniaturas">
${fotos.map((foto,index)=>`
<img
class="miniatura ${index===0 ? "ativa" : ""}"
src="${foto}"
/>
`).join("")}
</div>

</div>

<div class="painel">

<h1 class="titulo">
${titulo}
</h1>

<div class="meta">
${local}
</div>

${preco ? `
<div class="preco">
${preco}
</div>
` : ""}

<div class="descricao">
<h3>Descrição</h3>

<p>
${item.descricao || "Sem descrição."}
</p>
</div>

<div class="cta-app">

<h3>
Aplicativo disponível nas lojas
</h3>

<p>
Converse com anunciantes e publique veículos pelo app.
</p>

<div class="app-store-box">

<a class="app-store-btn" href="#">
Google Play
</a>

<a class="app-store-btn" href="#">
App Store
</a>

</div>

</div>

<div class="bloco">

<h3>
Compartilhar
</h3>

<p>
Compartilhe este anúncio.
</p>

<div class="share-grid">

<a class="share-btn" target="_blank"
href="https://wa.me/?text=${encodeURIComponent(window.location.href)}">

<svg viewBox="0 0 24 24" fill="currentColor">
<path d="M20 3.9A10 10 0 0 0 4.3 16.1L3 21l5-1.3A10 10 0 1 0 20 3.9Z"/>
</svg>

</a>

<a class="share-btn"
href="mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(window.location.href)}">

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M4 4h16v16H4z"/>
<path d="m22 6-10 7L2 6"/>
</svg>

</a>

<a class="share-btn" target="_blank"
href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}">

<svg viewBox="0 0 24 24" fill="currentColor">
<path d="M13 22v-8h3l1-4h-4V8c0-1.2.3-2 2-2h2V2.5A26 26 0 0 0 14 2c-3 0-5 1.8-5 5.2V10H6v4h3v8z"/>
</svg>

</a>

</div>

</div>

</div>

</section>
`;

}catch(e){

console.error(e);

conteudo.innerHTML = `
<div class="empty">
Erro ao carregar detalhe.
</div>
`;

}

}

carregar();
