const fs =
  require("fs");

const path =
  require("path");

const {
  initializeApp
} = require("firebase/app");

const {
  getFirestore,
  doc,
  getDoc
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyA9-eYhr2Bdadd4OWD17zIRszsz3LrxeBc",
  authDomain: "clube-da-caminhonete-be770.firebaseapp.com",
  projectId: "clube-da-caminhonete-be770",
  storageBucket: "clube-da-caminhonete-be770.firebasestorage.app",
  messagingSenderId: "559157035885",
  appId: "1:559157035885:web:8d3c4c8d7c7c5f7b3b2a91"
};

const app =
  initializeApp(
    firebaseConfig
  );

const db =
  getFirestore(app);

function formatarPreco(valor) {

  if (!valor) return "";

  const numero =
    Number(valor);

  if (
    Number.isNaN(numero)
  ) {
    return "";
  }

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function getPrimeiraFoto(item) {

  if (
    Array.isArray(item.fotos) &&
    item.fotos.length > 0
  ) {
    return item.fotos[0];
  }

  if (
    Array.isArray(item.imagens) &&
    item.imagens.length > 0
  ) {
    return item.imagens[0];
  }

  return (
    item.foto ||
    item.imagem ||
    item.imageUrl ||
    "https://volante.app.br/assets/logo.png"
  );
}

async function buscarDocumento(
  colecao,
  id
) {

  const referencia =
    doc(
      db,
      colecao,
      id
    );

  const snapshot =
    await getDoc(
      referencia
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return snapshot.data();
}

module.exports =
  async function handler(
    req,
    res
  ) {

    try {

      const {
        id
      } = req.query;

      if (!id) {

        res.statusCode = 400;

        res.end(
          "ID inválido."
        );

        return;
      }

      let item = null;

      let tipo =
        "anuncio";

      item =
        await buscarDocumento(
          "anuncios",
          id
        );

      if (!item) {

        item =
          await buscarDocumento(
            "eventos",
            id
          );

        tipo =
          "evento";
      }

      if (!item) {

        res.statusCode = 404;

        res.end(
          "Conteúdo não encontrado."
        );

        return;
      }

      const titulo =
        item.titulo ||
        item.nome ||
        "Volante App";

      const preco =
        tipo === "anuncio"
          ? formatarPreco(
              item.preco
            )
          : "";

      const cidade =
        item.cidade || "";

      const estado =
        item.estado ||
        item.uf ||
        "";

      const descricao =
        `${tipo === "evento" ? "Evento" : "Anúncio"} no Volante` +
        `${preco ? " • " + preco : ""}` +
        `${cidade ? " • " + cidade : ""}` +
        `${estado ? " - " + estado : ""}`;

      const imagem =
        getPrimeiraFoto(
          item
        );

      const shareUrl =
        `https://volante.app.br/share/${id}.html`;

      const detalheUrl =
        `https://volante.app.br/detalhe.html?tipo=${tipo}&id=${id}`;

      const modeloPath =
        path.join(
          process.cwd(),
          "share",
          "modelo.html"
        );

      let html =
        fs.readFileSync(
          modeloPath,
          "utf8"
        );

      html =
        html.replaceAll(
          "{{TITULO}}",
          titulo
        );

      html =
        html.replaceAll(
          "{{DESCRICAO}}",
          descricao
        );

      html =
        html.replaceAll(
          "{{IMAGEM}}",
          imagem
        );

      html =
        html.replaceAll(
          "{{URL}}",
          shareUrl
        );

      html =
        html.replaceAll(
          "{{DETALHE_URL}}",
          detalheUrl
        );

      const outputPath =
        path.join(
          process.cwd(),
          "share",
          `${id}.html`
        );

      fs.writeFileSync(
        outputPath,
        html,
        "utf8"
      );

      res.statusCode = 200;

      res.setHeader(
        "Content-Type",
        "application/json"
      );

      res.end(
        JSON.stringify({
          sucesso: true,
          arquivo:
            `/share/${id}.html`,
        })
      );

    } catch (erro) {

      console.error(
        erro
      );

      res.statusCode = 500;

      res.end(
        "Erro ao gerar share."
      );

    }

  };
