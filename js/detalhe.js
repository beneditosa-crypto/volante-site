window.compartilharDetalhe =
  async function () {

    if (navigator.share) {

      try {

        await navigator.share({
          title: "Volante App",
          url: shareUrl
        });

      } catch {}

      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

async function carregar() {

  if (!conteudo)
    return;

  if (!id) {

    conteudo.innerHTML = `
      <div class="empty">
        ID inválido.
      </div>
    `;

    return;
  }

  try {

    const colecoes =
      tipo === "evento"
        ? [
            "eventos",
            "anuncios",
          ]
        : [
            "anuncios",
            "eventos",
          ];

    let snapshotEncontrado =
      null;

    let colecaoUsada =
      "";

    for (const colecao of colecoes) {

      const referencia =
        doc(
          db,
          colecao,
          id
        );

      const snapshot =
        await getDoc(
          referencia
        );

      if (
        snapshot.exists()
      ) {

        snapshotEncontrado =
          snapshot;

        colecaoUsada =
          colecao;

        break;
      }
    }

    if (
      !snapshotEncontrado
    ) {

      conteudo.innerHTML = `
        <div class="empty">
          Conteúdo não encontrado.
        </div>
      `;

      return;
    }

    renderizar(
      {
        id:
          snapshotEncontrado.id,
        ...snapshotEncontrado.data(),
      },
      colecaoUsada
    );

  } catch (erro) {

    console.error(
      "Erro detalhe:",
      erro
    );

    conteudo.innerHTML = `
      <div class="empty">
        Erro ao carregar detalhe.
      </div>
    `;
  }
}

carregar();
