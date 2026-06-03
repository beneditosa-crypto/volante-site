function escapeHtml(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarPreco(valor) {
  if (valor === undefined || valor === null || valor === "") return "";

  const texto = String(valor).trim();

  if (!texto) return "";

  if (texto.startsWith("R$")) {
    const somenteNumero = texto.replace("R$", "").trim();
    return normalizarNumeroPreco(somenteNumero);
  }

  return normalizarNumeroPreco(texto);
}

function normalizarNumeroPreco(valor) {
  const texto = String(valor || "").trim();

  if (!texto) return "";

  let numero = 0;

  if (texto.includes(",") || texto.includes(".")) {
    const limpo = texto
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    numero = Number(limpo);
  } else {
    numero = Number(texto.replace(/\D/g, ""));
  }

  if (!numero || Number.isNaN(numero)) return "";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function campoTexto(fields, campo) {
  return fields?.[campo]?.stringValue || "";
}

function campoNumero(fields, campo) {
  return fields?.[campo]?.integerValue || fields?.[campo]?.doubleValue || "";
}

function primeiroArray(fields, campo) {
  return fields?.[campo]?.arrayValue?.values?.[0]?.stringValue || "";
}

function obterFoto(fields) {
  const opcoes = [
    primeiroArray(fields, "fotos"),
    primeiroArray(fields, "imagens"),
    primeiroArray(fields, "photos"),
    campoTexto(fields, "foto"),
    campoTexto(fields, "imagem"),
    campoTexto(fields, "imagemPrincipal"),
    campoTexto(fields, "capa"),
  ];

  const fotoValida = opcoes.find((url) => {
    const texto = String(url || "").trim();
    return texto.startsWith("https://");
  });

  return fotoValida || "https://volante.app.br/assets/logo.png";
}

function obterIdPorSlug(slug) {
  const texto = String(slug || "").trim();
  if (!texto) return "";

  const partes = texto.split("-");
  return partes[partes.length - 1] || texto;
}

function ehCrawler(userAgent) {
  const agente = String(userAgent || "").toLowerCase();

  return (
    agente.includes("whatsapp") ||
    agente.includes("facebookexternalhit") ||
    agente.includes("facebot") ||
    agente.includes("twitterbot") ||
    agente.includes("telegrambot") ||
    agente.includes("linkedinbot")
  );
}

export default async function handler(request, response) {
  const { id, slug, tipo } = request.query;

  const idFinal = id || obterIdPorSlug(slug);

  if (!idFinal) {
    return response.status(404).send("Conteúdo não encontrado");
  }

  try {
    const tipoTratado = String(tipo || "anuncio");
    const idTratado = String(idFinal);

    const colecao = tipoTratado === "evento" ? "eventos" : "anuncios";

    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/clube-da-caminhonete-be770/databases/(default)/documents/${colecao}/${idTratado}`;

    const firebaseResponse = await fetch(firebaseUrl);

    if (!firebaseResponse.ok) {
      return response.status(404).send("Conteúdo não encontrado");
    }

    const json = await firebaseResponse.json();
    const fields = json.fields || {};

    const tituloOriginal =
      campoTexto(fields, "titulo") ||
      campoTexto(fields, "nome") ||
      "Volante App";

    const descricaoCompleta =
      campoTexto(fields, "descricao") ||
      campoTexto(fields, "descrição") ||
      campoTexto(fields, "detalhes") ||
      "";

    const precoOriginal =
      campoTexto(fields, "preco") ||
      campoTexto(fields, "valor") ||
      campoNumero(fields, "preco") ||
      campoNumero(fields, "valor");

    const cidadeOriginal = campoTexto(fields, "cidade");
    const estadoOriginal = campoTexto(fields, "estado");

    const foto = obterFoto(fields);
    const preco = formatarPreco(precoOriginal);

    const local =
      cidadeOriginal || estadoOriginal
        ? `${cidadeOriginal || ""}${
            cidadeOriginal && estadoOriginal ? " - " : ""
          }${estadoOriginal || ""}`
        : "";

    const tituloSeo = tituloOriginal;

    const descricaoSeo =
      tipoTratado === "evento"
        ? [local, descricaoCompleta].filter(Boolean).join(" • ")
        : [preco, local].filter(Boolean).join(" • ");

    const titulo = escapeHtml(tituloSeo);
    const tituloVisual = escapeHtml(tituloOriginal);
    const descricao = escapeHtml(
      descricaoSeo || "Veja este conteúdo no Volante App."
    );
    const descricaoTexto = escapeHtml(descricaoCompleta);

    const slugOuId = slug || idTratado;

    const urlPublica =
      tipoTratado === "evento"
        ? `https://volante.app.br/evento/${encodeURIComponent(slugOuId)}`
        : `https://volante.app.br/anuncio/${encodeURIComponent(slugOuId)}`;

    const destino = `https://volante.app.br/detalhe.html?tipo=${encodeURIComponent(
      tipoTratado
    )}&id=${encodeURIComponent(idTratado)}`;

    const crawler = ehCrawler(request.headers["user-agent"]);

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
    );

    response.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<title>${titulo} | Volante</title>
<meta name="description" content="${descricao}" />

<meta property="og:locale" content="pt_BR" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Volante App" />
<meta property="og:title" content="${titulo}" />
<meta property="og:description" content="${descricao}" />
<meta property="og:url" content="${urlPublica}" />
<meta property="og:image" content="${foto}" />
<meta property="og:image:secure_url" content="${foto}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${titulo}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${titulo}" />
<meta name="twitter:description" content="${descricao}" />
<meta name="twitter:image" content="${foto}" />
<meta name="twitter:url" content="${urlPublica}" />

<link rel="canonical" href="${urlPublica}" />
<link rel="icon" type="image/png" href="https://volante.app.br/assets/favicon.png" />

${crawler ? "" : `<meta http-equiv="refresh" content="0; url=${destino}" />`}
</head>

<body>
${
  crawler
    ? ""
    : `<script>window.location.replace("${destino}");</script>`
}

<main>
  <h1>${tituloVisual}</h1>
  <p>${descricao}</p>
  <img src="${foto}" alt="${titulo}" style="max-width:100%;height:auto;" />
  ${descricaoTexto ? `<p>${descricaoTexto}</p>` : ""}
  <p><a href="${destino}">Ver detalhes no Volante</a></p>
</main>
</body>
</html>`);
  } catch {
    response.status(500).send("Erro ao gerar Open Graph");
  }
}
