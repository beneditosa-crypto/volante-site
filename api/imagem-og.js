export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("Imagem não informada");
    }

    const resposta = await fetch(url);

    if (!resposta.ok) {
      return res.status(404).send("Imagem não encontrada");
    }

    const buffer = Buffer.from(await resposta.arrayBuffer());

    res.setHeader("Content-Type", resposta.headers.get("content-type") || "image/jpeg");

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    return res.status(200).send(buffer);
  } catch (erro) {
    console.error("Erro imagem-og:", erro);

    return res.status(500).send("Erro interno");
  }
}
