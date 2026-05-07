function obterUF(item) {
  const campos = [
    item.uf,
    item.estado,
    item.local,
    item.endereco,
    item.cidade
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  if (
    campos.includes("GO") ||
    campos.includes("GOIÁS") ||
    campos.includes("GOIAS")
  ) return "GO";

  if (
    campos.includes("DF") ||
    campos.includes("DISTRITO FEDERAL") ||
    campos.includes("BRASÍLIA") ||
    campos.includes("BRASILIA")
  ) return "DF";

  if (
    campos.includes("SP") ||
    campos.includes("SÃO PAULO") ||
    campos.includes("SAO PAULO")
  ) return "SP";

  if (
    campos.includes("RJ") ||
    campos.includes("RIO DE JANEIRO")
  ) return "RJ";

  if (
    campos.includes("MG") ||
    campos.includes("MINAS")
  ) return "MG";

  if (
    campos.includes("ES") ||
    campos.includes("ESPÍRITO SANTO") ||
    campos.includes("ESPIRITO SANTO")
  ) return "ES";

  if (
    campos.includes("PR") ||
    campos.includes("PARANÁ") ||
    campos.includes("PARANA")
  ) return "PR";

  if (
    campos.includes("SC") ||
    campos.includes("SANTA CATARINA")
  ) return "SC";

  if (
    campos.includes("RS") ||
    campos.includes("RIO GRANDE DO SUL")
  ) return "RS";

  if (
    campos.includes("BA") ||
    campos.includes("BAHIA")
  ) return "BA";

  if (
    campos.includes("PE") ||
    campos.includes("PERNAMBUCO")
  ) return "PE";

  if (
    campos.includes("CE") ||
    campos.includes("CEARÁ") ||
    campos.includes("CEARA")
  ) return "CE";

  if (
    campos.includes("AM") ||
    campos.includes("AMAZONAS")
  ) return "AM";

  if (
    campos.includes("PA") ||
    campos.includes("PARÁ") ||
    campos.includes("PARA")
  ) return "PA";

  return "";
}
