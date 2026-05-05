// MANTIDO EXATAMENTE SEU ARQUIVO — SEM ALTERAÇÃO DE LÓGICA

// única mudança: função card()

function card(item) {
  const status = normalizarStatus(item.status);
  const fotos = Array.isArray(item.fotos) ? item.fotos : [];

  const titulo = escapar(item.titulo || item.nome || "Sem título");

  const descricao = escapar(
    item.descricao ||
    item.descrição ||
    item.detalhes ||
    item.observacao ||
    item.texto ||
    ""
  );

  const email = escapar(
    item.email ||
    item.usuarioEmail ||
    item.criadorEmail ||
    item.vendedorEmail ||
    "Não informado"
  );

  const cidade = escapar(item.cidade || "");
  const estado = escapar(item.estado || "");
  const local = cidade || estado ? `${cidade}${cidade && estado ? " / " : ""}${estado}` : "";

  const data = formatarData(
    item.criadoEm ||
    item.createdAt ||
    item.atualizadoEm ||
    item.dataCriacao
  );

  return `
    <article class="item">
      <div><span class="tipo">${item.tipo}</span></div>

      <div class="titulo">${titulo}</div>

      <div class="descricao">${descricao}</div>

      <div class="usuario">${email}</div>

      <div class="local">${escapar(local)}</div>

      <div class="data">${data}</div>

      <div><span class="status ${status}">${status}</span></div>

      <div class="botoes">
        <button class="btn-aprovar" onclick="aprovar('${item.id}','${item.colecao}')">OK</button>
        <button class="btn-devolver" onclick="devolver('${item.id}','${item.colecao}')">DEV</button>
        <button class="btn-inativar" onclick="inativar('${item.id}','${item.colecao}')">OFF</button>
        <button class="btn-excluir" onclick="excluirDaBase('${item.id}','${item.colecao}')">X</button>
      </div>

      <div class="fotos">
        ${fotos.map((foto) => `<img src="${escapar(foto)}" />`).join("")}
      </div>
    </article>
  `;
}
