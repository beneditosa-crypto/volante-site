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

  if (texto.startsWith("R$")) return texto;

  return `R$ ${texto}`;
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
    const preco = normalizarPreco(precoOriginal);

    const local =
      cidadeOriginal || estadoOriginal
        ? `${cidadeOriginal || ""}${
            cidadeOriginal && estadoOriginal ? " - " : ""
          }${estadoOriginal || ""}`
        : "";

    const descricaoSeo =
      tipoTratado === "evento"
        ? [local, descricaoCompleta].filter(Boolean).join(" • ")
        : [preco, local].filter(Boolean).join(" • ");

    const titulo = escapeHtml(tituloOriginal);
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
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${titulo}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${titulo}" />
<meta name="twitter:description" content="${descricao}" />
<meta name="twitter:image" content="${foto}" />

<link rel="canonical" href="${urlPublica}" />
<link rel="icon" type="image/png" href="https://volante.app.br/assets/favicon.png" />

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f6f8fb;
    color: #0f172a;
  }

  header {
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
  }

  .topo {
    max-width: 1180px;
    margin: 0 auto;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .marca {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #0f172a;
  }

  .logo {
    width: 54px;
    height: 54px;
    object-fit: contain;
  }

  .nome {
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
  }

  .slogan {
    margin-top: 3px;
    font-size: 14px;
    color: #64748b;
    font-weight: 700;
  }

  main {
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 20px 44px;
  }

  .btn-voltar {
    display: inline-block;
    margin-bottom: 22px;
    color: #1e3a8a;
    font-weight: 900;
    text-decoration: none;
  }

  .card {
    overflow: hidden;
    border-radius: 28px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  }

  .foto {
    width: 100%;
    max-height: 620px;
    object-fit: cover;
    display: block;
    background: #e5e7eb;
  }

  .conteudo {
    padding: 28px;
  }

  h1 {
    margin: 0 0 12px;
    font-size: clamp(32px, 4vw, 54px);
    line-height: 1.03;
    letter-spacing: -1.2px;
    color: #0f172a;
  }

  .meta {
    margin: 0 0 22px;
    font-size: 22px;
    font-weight: 800;
    color: #1f2937;
  }

  .descricao {
    margin: 0 0 26px;
    color: #334155;
    font-size: 17px;
    line-height: 1.55;
  }

  .cta {
    margin-top: 24px;
    padding: 24px;
    border-radius: 22px;
    background: linear-gradient(135deg, #eef5ff, #ffffff);
    border: 1px solid rgba(30, 58, 138, 0.12);
    text-align: center;
  }

  .cta h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #0f172a;
  }

  .cta p {
    margin: 0 0 18px;
    color: #334155;
    font-size: 16px;
    line-height: 1.45;
  }

  .botao {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    padding: 0 24px;
    border-radius: 16px;
    background: #1e3a8a;
    color: #ffffff;
    font-size: 16px;
    font-weight: 900;
    text-decoration: none;
    box-shadow: 0 12px 26px rgba(30, 58, 138, 0.20);
  }

  footer {
    margin-top: 34px;
    text-align: center;
    color: #64748b;
    font-size: 14px;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    .topo {
      padding: 14px 16px;
    }

    .logo {
      width: 46px;
      height: 46px;
    }

    .nome {
      font-size: 21px;
    }

    main {
      padding: 18px 14px 34px;
    }

    .card {
      border-radius: 22px;
    }

    .conteudo {
      padding: 20px;
    }

    .meta {
      font-size: 18px;
      line-height: 1.35;
    }

    .descricao {
      font-size: 15px;
    }

    .cta {
      padding: 20px;
    }

    .cta h2 {
      font-size: 21px;
    }

    .botao {
      width: 100%;
    }
  }
</style>
</head>

<body>
<header>
  <div class="topo">
    <a href="https://volante.app.br/" class="marca">
      <img src="https://volante.app.br/assets/logo.png" alt="Volante App" class="logo" />
      <div>
        <div class="nome">Volante</div>
        <div class="slogan">Mais que carros, paixão</div>
      </div>
    </a>
  </div>
</header>

<main>
  <a href="https://volante.app.br/" class="btn-voltar">← Voltar para o início</a>

  <article class="card">
    <img src="${foto}" alt="${titulo}" class="foto" />

    <div class="conteudo">
      <h1>${titulo}</h1>

      <p class="meta">${descricao}</p>

      ${
        descricaoTexto
          ? `<p class="descricao">${descricaoTexto}</p>`
          : ""
      }

      <div class="cta">
        <h2>O Volante fica melhor no app.</h2>
        <p>Para anunciar, publicar eventos ou conversar com anunciantes, baixe o app do Volante.</p>
        <a href="${destino}" class="botao">Ver detalhes</a>
      </div>
    </div>
  </article>

  <footer>
    Volante App © 2026. Todos os direitos reservados.
  </footer>
</main>
</body>
</html>`);
  } catch {
    response.status(500).send("Erro ao gerar Open Graph");
  }
}
