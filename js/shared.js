export function escapeHtml(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizar(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function textoLocal(item) {
  const cidade = item.cidade || "";
  const estado = item.estado || item.uf || "";

  if (cidade && estado) {
    return `${cidade} - ${estado}`;
  }

  return cidade || estado || "";
}

export function getImagem(item) {
  if (Array.isArray(item.fotos) && item.fotos.length > 0) {
    return item.fotos[0];
  }

  if (Array.isArray(item.imagens) && item.imagens.length > 0) {
    return item.imagens[0];
  }

  if (item.foto) return item.foto;
  if (item.imagem) return item.imagem;
  if (item.imageUrl) return item.imageUrl;

  return "";
}

export function getDataMs(item) {
  if (item.data?.seconds) {
    return item.data.seconds * 1000;
  }

  if (item.criadoEm?.seconds) {
    return item.criadoEm.seconds * 1000;
  }

  if (item.createdAt?.seconds) {
    return item.createdAt.seconds * 1000;
  }

  if (item.atualizadoEm?.seconds) {
    return item.atualizadoEm.seconds * 1000;
  }

  return 0;
}

export function formatarPreco(valor) {
  if (!valor) return "";

  const texto = String(valor);

  if (texto.includes("R$")) {
    return texto;
  }

  const numero = Number(texto.replace(/\D/g, ""));

  if (!numero) return texto;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

const FAVORITOS_KEY =
  "volante_favoritos";

export function obterFavoritos() {
  return JSON.parse(
    localStorage.getItem(FAVORITOS_KEY) || "[]"
  );
}

export function ehFavorito(id) {
  return obterFavoritos().includes(id);
}

export function toggleFavorito(id) {
  const favoritos =
    obterFavoritos();

  const existe =
    favoritos.includes(id);

  const atualizados =
    existe
      ? favoritos.filter((item) => item !== id)
      : [...favoritos, id];

  localStorage.setItem(
    FAVORITOS_KEY,
    JSON.stringify(atualizados)
  );

  window.location.reload();
}

export function baixarApp() {
  alert(
    "Em breve, o Volante estará disponível nas lojas."
  );
}

window.baixarApp = baixarApp;
