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

    const id =
      req.query.id;

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

    const detalheUrl =
      `https://volante.app.br/detalhe.html?tipo=${tipo}&id=${id}`;

    const shareUrl =
      `https://volante.app.br/s/${id}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>

<meta charset="UTF-8" />

<title>${titulo}</title>

<meta
  name="description"
  content="${descricao}"
/>

<meta
  property="og:title"
  content="${titulo}"
/>

<meta
  property="og:description"
  content="${descricao}"
/>

<meta
  property="og:type"
  content="website"
/>

<meta
  property="og:url"
  content="${shareUrl}"
/>

<meta
  property="og:image"
  content="${imagem}"
/>

<meta
  property="og:image:secure_url"
  content="${imagem}"
/>

<meta
  property="og:image:width"
  content="1200"
/>

<meta
  property="og:image:height"
  content="630"
/>

<meta
  property="og:site_name"
  content="Volante App"
/>

<meta
  name="twitter:card"
  content="summary_large_image"
/>

<meta
  name="twitter:title"
  content="${titulo}"
/>

<meta
  name="twitter:description"
  content="${descricao}"
/>

<meta
  name="twitter:image"
  content="${imagem}"
/>

<meta
  http-equiv="refresh"
  content="2; url=${detalheUrl}"
/>

<link
  rel="canonical"
  href="${shareUrl}"
/>

<style>

body{
  margin:0;
  padding:40px;
  background:#ffffff;
  color:#111827;
  font-family:Arial,sans-serif;
}

.container{
  max-width:720px;
  margin:0 auto;
}

.logo{
  width:84px;
  margin-bottom:24px;
}

h1{
  font-size:34px;
  line-height:1.2;
  margin-bottom:16px;
}

p{
  font-size:18px;
  line-height:1.6;
  color:#374151;
}

.imagem{
  width:100%;
  border-radius:24px;
  margin-top:28px;
}

.botao{
  display:inline-block;
  margin-top:28px;
  padding:16px 28px;
  background:#111827;
  color:#ffffff;
  border-radius:14px;
  text-decoration:none;
  font-weight:bold;
}

</style>

</head>

<body>

<div class="container">

  <img
    src="https://volante.app.br/assets/logo.png"
    class="logo"
    alt="Volante"
  />

  <h1>
    ${titulo}
  </h1>

  <p>
    ${descricao}
  </p>

  <img
    src="${imagem}"
    class="imagem"
    alt="${titulo}"
  />

  <br />

  <a
    href="${detalheUrl}"
    class="botao"
  >
    Abrir no Volante
  </a>

</div>

</body>
</html>
`;

    res.statusCode = 200;

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );

    res.end(html);

  };
