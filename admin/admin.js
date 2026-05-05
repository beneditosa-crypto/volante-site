// (Firebase igual ao seu — mantido)

// NOVAS FEATURES

const buscaInput = document.getElementById("busca");
let ordenacao = { campo: "data", asc: false };

buscaInput.addEventListener("input", render);

window.ordenar = function (campo) {
  ordenacao.asc = ordenacao.campo === campo ? !ordenacao.asc : true;
  ordenacao.campo = campo;
  render();
};

function aplicarBusca(lista) {
  const termo = buscaInput.value.toLowerCase();
  return lista.filter(item =>
    JSON.stringify(item).toLowerCase().includes(termo)
  );
}

function aplicarOrdenacao(lista) {
  return lista.sort((a, b) => {
    const valA = (a[ordenacao.campo] || "").toString();
    const valB = (b[ordenacao.campo] || "").toString();

    return ordenacao.asc
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });
}

// MODAL
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
document.getElementById("fecharModal").onclick = () => modal.classList.add("hidden");

function abrirModal(item) {
  modalBody.innerHTML = `
    <h2>${item.titulo || item.nome}</h2>
    <p>${item.descricao || ""}</p>
    <p><b>Email:</b> ${item.email}</p>
  `;
  modal.classList.remove("hidden");
}

// RENDER
function render() {
  renderResumo();

  let listaFiltrada = dados.filter(item =>
    filtroAtual === "TODOS" ||
    normalizarStatus(item.status) === filtroAtual
  );

  listaFiltrada = aplicarBusca(listaFiltrada);
  listaFiltrada = aplicarOrdenacao(listaFiltrada);

  lista.innerHTML = listaFiltrada.map(item => card(item)).join("");
}

// CARD
function card(item) {
  const status = normalizarStatus(item.status);

  return `
    <article class="item">
      <div>${item.tipo}</div>
      <div class="titulo" onclick='abrirModal(${JSON.stringify(item)})'>${item.titulo || ""}</div>
      <div class="descricao">${item.descricao || ""}</div>
      <div>${item.email || ""}</div>
      <div>${item.cidade || ""}</div>
      <div>${formatarData(item.criadoEm)}</div>
      <div class="status ${status}">${status}</div>

      <div class="botoes">
        <button class="btn-aprovar" onclick="aprovar('${item.id}','${item.colecao}')">✔</button>
        <button class="btn-devolver" onclick="devolver('${item.id}','${item.colecao}')">↩</button>
        <button class="btn-inativar" onclick="inativar('${item.id}','${item.colecao}')">⛔</button>
        <button class="btn-excluir" onclick="excluirDaBase('${item.id}','${item.colecao}')">🗑</button>
      </div>

      <div class="fotos">
        ${(item.fotos || []).map(f => `<img src="${f}" />`).join("")}
      </div>
    </article>
  `;
}
