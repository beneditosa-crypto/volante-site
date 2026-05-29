function escapeHtml(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarPreco(valor) {
  if (!valor) return "";

  const texto = String(valor).trim();

  if (texto.startsWith("R$")) {
    return texto;
  }

  return `R$ ${texto}`;
}

function campoTexto(fields, campo) {
  return fields?.[campo]?.stringValue || "";
}

function campoNumero(fields, campo) {
  return (
    fields?.[campo]?.integerValue ||
    fields?.[campo]?.doubleValue ||
    ""
  );
}

function primeiroArray(fields, campo) {
  return (
    fields?.[campo]?.arrayValue?.values?.[0]?.stringValue ||
    ""
  );
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

export default async function handler(request, response) {
  const {
    id,
    slug,
    tipo,
  } = request.query;

  const idFinal =
    id || obterIdPorSlug(slug);

  if (!idFinal) {
    return response.status(404).send("Anúncio não encontrado");
  }

  try {
    const tipoTratado = String(tipo || "anuncio");
    const idTratado = String(idFinal);

    const colecao =
      tipoTratado === "evento"
        ? "eventos"
        : "anuncios";

    const firebaseUrl =
      `https://firestore.googleapis.com/v1/projects/clube-da-caminhonete-be770/databases/(default)/documents/${colecao}/${idTratado}`;

    const firebaseResponse =
      await fetch(firebaseUrl);

    if (!firebaseResponse.ok) {
      return response.status(404).send("Anúncio não encontrado");
    }

    const json = await firebaseResponse.json();
    const fields = json.fields || {};

    const tituloOriginal =
      campoTexto(fields, "titulo") ||
      campoTexto(fields, "nome") ||
      "Volante App";

    const precoOriginal =
      campoTexto(fields, "preco") ||
      campoNumero(fields, "preco");

    const cidadeOriginal = campoTexto(fields, "cidade");
    const estadoOriginal = campoTexto(fields, "estado");

    const foto = obterFoto(fields);
    const preco = normalizarPreco(precoOriginal);

    const local =
      cidadeOriginal || estadoOriginal
        ? `${cidadeOriginal || ""}${
            cidadeOriginal && estadoOriginal ? " - " : ""
          }${estadoOriginal || ""}`
        : "";

    const descricaoOriginal =
      tipoTratado === "evento"
        ? [local].filter(Boolean).join(" • ")
        : [preco, local].filter(Boolean).join(" • ");

    const titulo = escapeHtml(tituloOriginal);

    const descricao = escapeHtml(
      descricaoOriginal || "Veja este conteúdo no Volante App."
    );

    const slugOuId =
      slug || idTratado;

    const urlPublica =
      tipoTratado === "evento"
        ? `https://volante.app.br/evento/${encodeURIComponent(slugOuId)}`
        : `https://volante.app.br/anuncio/${encodeURIComponent(slugOuId)}`;

    const destino =
      `https://volante.app.br/detalhe.html?tipo=${encodeURIComponent(
        tipoTratado
      )}&id=${encodeURIComponent(idTratado)}`;

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

<title>${titulo}</title>
<meta name="description" content="${descricao}" />

<meta property="og:locale" content="pt_BR" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Volante App" />
<meta property="og:title" content="${titulo}" />
<meta property="og:description" content="${descricao}" />
<meta property="og:url" content="${urlPublica}" />
<meta property="og:image" content="${foto}" />
<meta property="og:image:secure_url" content="${foto}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${titulo}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${titulo}" />
<meta name="twitter:description" content="${descricao}" />
<meta name="twitter:image" content="${foto}" />

<link rel="canonical" href="${urlPublica}" />

<meta http-equiv="refresh" content="2; url=${destino}" />

<script>
  setTimeout(function () {
    window.location.replace("${destino}");
  }, 1200);
</script>
</head>

<body>
  <main style="font-family: Arial, sans-serif; padding: 24px;">
    <h1>${titulo}</h1>
    <p>${descricao}</p>
    <p>
      <a href="${destino}">
        Abrir no Volante App
      </a>
    </p>
  </main>
</body>
</html>`);
  } catch {
    response.status(500).send("Erro ao gerar Open Graph");
  }
}
