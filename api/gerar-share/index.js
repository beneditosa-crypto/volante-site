const fs =
  require("fs");

const path =
  require("path");

const PROJECT_ID =
  "clube-da-caminhonete-be770";

function getValor(campo) {

  if (!campo) return "";

  if (
    campo.stringValue !== undefined
  ) {
    return campo.stringValue;
  }

  if (
    campo.integerValue !== undefined
  ) {
    return campo.integerValue;
  }

  if (
    campo.doubleValue !== undefined
  ) {
    return campo.doubleValue;
  }

  if (
    campo.booleanValue !== undefined
  ) {
    return campo.booleanValue;
  }

  if (
    campo.arrayValue?.values
  ) {
    return campo.arrayValue.values.map(
      getValor
    );
  }

  return "";
}

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

  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents/${colecao}/${id}`;

  const resposta =
    await fetch(url);

  if (!resposta.ok) {
    return null;
  }

  const json =
    await resposta.json();

  const fields =
    json.fields || {};

  const item = {};

  Object.keys(fields).forEach(
    (chave) => {

      item[chave] =
        getValor(
          fields[chave]
        );

    }
  );

  return item;
}

module.exports =
  async function handler(
    req,
    res
  ) {

    const {
      id,
      tipo = "anuncio",
    } = req.query;

    if (!id) {

      res.statusCode = 400;

      res.end(
        "ID inválido."
      );

      return;
    }

    const colecao =
      tipo === "evento"
        ? "eventos"
        : "anuncios";

    const item =
      await buscarDocumento(
        colecao,
        id
      );

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

  };
