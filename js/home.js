```js
function obterUF(item) {
  const texto = [
    item.uf,
    item.estado,
    item.local,
    item.endereco,
    item.cidade
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  const estados = {
    AC: ["AC", "ACRE"],
    AL: ["AL", "ALAGOAS"],
    AP: ["AP", "AMAPÁ", "AMAPA"],
    AM: ["AM", "AMAZONAS"],
    BA: ["BA", "BAHIA"],
    CE: ["CE", "CEARÁ", "CEARA"],
    DF: [
      "DF",
      "DISTRITO FEDERAL",
      "BRASÍLIA",
      "BRASILIA"
    ],
    ES: [
      "ES",
      "ESPÍRITO SANTO",
      "ESPIRITO SANTO"
    ],
    GO: ["GO", "GOIÁS", "GOIAS"],
    MA: ["MA", "MARANHÃO", "MARANHAO"],
    MT: ["MT", "MATO GROSSO"],
    MS: ["MS", "MATO GROSSO DO SUL"],
    MG: [
      "MG",
      "MINAS GERAIS",
      "MINAS"
    ],
    PA: ["PA", "PARÁ", "PARA"],
    PB: ["PB", "PARAÍBA", "PARAIBA"],
    PR: ["PR", "PARANÁ", "PARANA"],
    PE: ["PE", "PERNAMBUCO"],
    PI: ["PI", "PIAUÍ", "PIAUI"],
    RJ: ["RJ", "RIO DE JANEIRO"],
    RN: ["RN", "RIO GRANDE DO NORTE"],
    RS: ["RS", "RIO GRANDE DO SUL"],
    RO: ["RO", "RONDÔNIA", "RONDONIA"],
    RR: ["RR", "RORAIMA"],
    SC: ["SC", "SANTA CATARINA"],
    SP: [
      "SP",
      "SÃO PAULO",
      "SAO PAULO"
    ],
    SE: ["SE", "SERGIPE"],
    TO: ["TO", "TOCANTINS"]
  };

  for (const uf in estados) {
    const variacoes = estados[uf];

    const encontrou =
      variacoes.some((valor) =>
        texto.includes(valor)
      );

    if (encontrou) {
      return uf;
    }
  }

  return "";
}
```
