
export function escapeHtml(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function textoLocal(item) {
  const cidade = item.cidade || "";
  const estado = item.estado || item.uf || "";

  if (cidade && estado) {
    return `${cidade} - ${estado}`;
  }

  return cidade || estado || "";
}

export function formatarPreco(valor) {
  if (!valor) return "";

  const texto = String(valor);

  if (texto.includes("R$")) {
    return texto;
  }

  const numero =
    Number(
      texto.replace(/\D/g, "")
    );

  if (!numero) return "";

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}

export function getFotos(item) {

  if (
    Array.isArray(item.fotos) &&
    item.fotos.length > 0
  ) {
    return item.fotos;
  }

  if (
    Array.isArray(item.imagens) &&
    item.imagens.length > 0
  ) {
    return item.imagens;
  }

  if (item.foto) {
    return [item.foto];
  }

  if (item.imagem) {
    return [item.imagem];
  }

  return [
    "https://placehold.co/1200x900?text=Volante"
  ];
}

export function baixarApp() {
  alert(
    "Em breve nas lojas."
  );
}
