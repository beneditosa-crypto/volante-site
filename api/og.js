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

export default async function handler(request, response) {
  const { id, tipo } = request.query;

  if (!id) {
    return response.status(404).send("Anúncio não encontrado");
  }

  try {
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/clube-da-caminhonete-be770/databases/(default)/documents/anuncios/${id}`;

    const firebaseResponse = await fetch(firebaseUrl);

    if (!firebaseResponse.ok) {
      return response.status(404).send("Anúncio não encontrado");
    }

    const json = await firebaseResponse.json();

    const fields = json.fields || {};

    function texto(campo) {
      return fields?.[campo]?.stringValue || "";
    }

    function numero(campo) {
      return fields?.[campo]?.integerValue || fields?.[campo]?.doubleValue || "";
    }

    function arrayPrimeiro(campo) {
      return fields?.[campo]?.arrayValue?.values?.[0]?.stringValue || "";
    }

    const tituloOriginal = texto("titulo") || "Veículo anunciado no Volante App";

    const precoOriginal = texto("preco") || numero("preco");

    const cidadeOriginal = texto("cidade");

    const estadoOriginal = texto("estado");

    const fotoOriginal =
      arrayPrimeiro("fotos") || "https://volante.app.br/assets/logo.png";

    const preco = normalizarPreco(precoOriginal);

    const local =
      cidadeOriginal || estadoOriginal
        ? `${cidadeOriginal || ""}${
            cidadeOriginal && estadoOriginal ? " - " : ""
          }${estadoOriginal || ""}`
        : "";

    const descricaoOriginal = [preco, local].filter(Boolean).join(" • ");

    const titulo = escapeHtml(tituloOriginal);

    const descricao = escapeHtml(
      descricaoOriginal || "Veja este anúncio no Volante App."
    );

    const foto = fotoOriginal;

    const tipoTratado = escapeHtml(tipo || "anuncio");

    const idTratado = escapeHtml(id);

    const url = `https://volante.app.br/api/og?tipo=${tipoTratado}&id=${idTratado}`;

    const destino = `https://volante.app.br/detalhe.html?tipo=${tipoTratado}&id=${idTratado}`;

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
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${foto}" />
<meta property="og:image:secure_url" content="${foto}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${titulo}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${titulo}" />
<meta name="twitter:description" content="${descricao}" />
<meta name="twitter:image" content="${foto}" />

<link rel="canonical" href="${url}" />
</head>

<body>
  <main style="font-family: Arial, sans-serif; padding: 24px;">
    <h1>${titulo}</h1>
    <p>${descricao}</p>
    <p>
      <a href="${destino}">
        Abrir anúncio no Volante App
      </a>
    </p>
  </main>
</body>
</html>`);
  } catch {
    response.status(500).send("Erro ao gerar Open Graph");
  }
}
