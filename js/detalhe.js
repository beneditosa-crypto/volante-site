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

carregar();
