export default async function handler(
  request,
  response
) {
  const {
    id,
    tipo,
  } = request.query;

  if (!id) {
    return response
      .status(404)
      .send(
        "Anúncio não encontrado"
      );
  }

  try {
    const firebaseUrl =
      `https://firestore.googleapis.com/v1/projects/clube-da-caminhonete-be770/databases/(default)/documents/anuncios/${id}`;

    const firebaseResponse =
      await fetch(firebaseUrl);

    if (
      !firebaseResponse.ok
    ) {
      return response
        .status(404)
        .send(
          "Anúncio não encontrado"
        );
    }

    const json =
      await firebaseResponse.json();

    const fields =
      json.fields || {};

    function texto(
      campo
    ) {
      return (
        fields?.[
          campo
        ]?.stringValue || ""
      );
    }

    function numero(
      campo
    ) {
      return (
        fields?.[
          campo
        ]?.integerValue ||
        ""
      );
    }

    function arrayPrimeiro(
      campo
    ) {
      return (
        fields?.[
          campo
        ]?.arrayValue?.values?.[0]
          ?.stringValue || ""
      );
    }

    const titulo =
      texto("titulo") ||
      "Veículo antigo";

    const preco =
      texto("preco") ||
      numero("preco");

    const cidade =
      texto("cidade");

    const estado =
      texto("estado");

    const foto =
      arrayPrimeiro(
        "fotos"
      ) ||
      "https://volante.app.br/assets/logo.png";

    const descricao =
      `${preco ? `R$ ${preco}` : ""}${
        cidade
          ? ` • ${cidade}`
          : ""
      }${
        estado
          ? ` - ${estado}`
          : ""
      }`;

const url =
  `https://volante.app.br/detalhe?tipo=${tipo || "anuncio"}&id=${id}`;

    response.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );

    response.status(200).send(`
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
  property="og:type"
  content="website"
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
  property="og:image"
  content="${foto}"
/>

<meta
  property="og:url"
  content="${url}"
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
  content="${foto}"
/>

<meta
  http-equiv="refresh"
  content="0; url=${url}"
/>

</head>

<body>
Redirecionando...
</body>
</html>
    `);
  } catch {
    response
      .status(500)
      .send(
        "Erro ao gerar Open Graph"
      );
  }
}
