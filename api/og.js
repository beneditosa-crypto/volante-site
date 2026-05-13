const PROJECT_ID = "clube-da-caminhonete-be770";

function escapeHtml(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getValor(campo) {
  if (!campo) return "";

  if (campo.stringValue !== undefined) return campo.stringValue;
  if (campo.integerValue !== undefined) return campo.integerValue;
  if (campo.doubleValue !== undefined) return campo.doubleValue;
  if (campo.booleanValue !== undefined) return campo.booleanValue;

  if (campo.arrayValue?.values) {
    return campo.arrayValue.values.map(getValor);
  }

  return "";
}

function formatarPreco(valor) {
  if (!valor) return "";

  if (String(valor).includes("R$")) {
    return String(valor);
  }

  const numero = Number(valor);

  if (Number.isNaN(numero)) return "";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

  const resposta = await fetch(url);

  if (!resposta.ok) return null;

  const json = await resposta.json();

  const fields = json.fields || {};

  const item = {};

  Object.keys(fields).forEach((chave) => {
    item[chave] = getValor(
      fields[chave]
    );
  });

  return item;
}

export default async function handler(
  req,
  res
) {
  const {
    id,
    tipo = "anuncio",
  } = req.query;

  if (!id) {
    res.status(400).send(
      "ID inválido."
    );

    return;
  }

  const colecoes =
    tipo === "evento"
      ? ["eventos", "anuncios"]
      : ["anuncios", "eventos"];

  let item = null;

  let colecaoUsada = "";

  for (const colecao of colecoes) {
    item = await buscarDocumento(
      colecao,
      id
    );

    if (item) {
      colecaoUsada = colecao;
      break;
    }
  }

  if (!item) {
    res.status(404).send(
      "Conteúdo não encontrado."
    );

    return;
  }

  const ehEvento =
    colecaoUsada === "eventos";

  const titulo =
    item.titulo ||
    item.nome ||
    `${item.marca || ""} ${item.modelo || ""}`.trim() ||
    "Volante App";

  const preco = !ehEvento
    ? formatarPreco(item.preco)
    : "";

  const cidade =
    item.cidade || "";

  const estado =
    item.estado ||
    item.uf ||
    "";

  const local =
    cidade && estado
      ? `${cidade} - ${estado}`
      : cidade ||
        estado ||
        "";

  const descricao =
    `${ehEvento ? "Evento" : "Anúncio"} no Volante` +
    `${preco ? " • " + preco : ""}` +
    `${local ? " • " + local : ""}`;

  const imagem =
    getPrimeiraFoto(item);

  const detalheUrl =
    `https://volante.app.br/detalhe.html?tipo=${
      ehEvento
        ? "evento"
        : "anuncio"
    }&id=${id}`;

  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "no-store, max-age=0"
  );

  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>

<meta charset="UTF-8" />

<title>${escapeHtml(titulo)} | Volante App</title>

<meta
  name="description"
  content="${escapeHtml(descricao)}"
/>

<meta
  property="og:title"
  content="${escapeHtml(titulo)}"
/>

<meta
  property="og:description"
  content="${escapeHtml(descricao)}"
/>

<meta
  property="og:type"
  content="website"
/>

<meta
  property="og:url"
  content="https://volante.app.br/api/og?tipo=${ehEvento ? "evento" : "anuncio"}&id=${id}"
/>

<meta
  property="og:image"
  content="${escapeHtml(imagem)}"
/>

<meta
  property="og:image:secure_url"
  content="${escapeHtml(imagem)}"
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
  content="${escapeHtml(titulo)}"
/>

<meta
  name="twitter:description"
  content="${escapeHtml(descricao)}"
/>

<meta
  name="twitter:image"
  content="${escapeHtml(imagem)}"
/>

<style>
body{
  font-family:Arial,sans-serif;
  padding:40px;
  background:#ffffff;
  color:#111827;
}
a{
  color:#1E3A8A;
  text-decoration:none;
  font-weight:bold;
}
</style>

</head>

<body>

<h1>
  ${escapeHtml(titulo)}
</h1>

<p>
  ${escapeHtml(descricao)}
</p>

<p>
  <a href="${escapeHtml(detalheUrl)}">
    Abrir no Volante
  </a>
</p>

</body>
</html>`);
}
