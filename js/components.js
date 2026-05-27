.grid,
.grid-horizontal,
.carousel-1linha {
  width: 100%;

  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(260px, 300px);

  gap: 16px;

  overflow-x: auto;
  overflow-y: hidden;

  padding: 2px 2px 14px;

  scroll-snap-type: x mandatory;
}

.grid::-webkit-scrollbar,
.grid-horizontal::-webkit-scrollbar,
.carousel-1linha::-webkit-scrollbar {
  height: 8px;
}

.grid::-webkit-scrollbar-thumb,
.grid-horizontal::-webkit-scrollbar-thumb,
.carousel-1linha::-webkit-scrollbar-thumb {
  background: rgba(15,23,42,.12);
  border-radius: 999px;
}

.card {
  width: 100%;

  border-radius: 24px;

  overflow: hidden;

  background: #fff;

  border: 1px solid rgba(15,23,42,.07);

  box-shadow: 0 10px 26px rgba(15,23,42,.06);

  cursor: pointer;

  scroll-snap-align: start;

  transition:
    transform .22s ease,
    box-shadow .22s ease,
    border-color .22s ease;
}

.card:hover {
  transform: translateY(-2px);

  box-shadow: 0 16px 34px rgba(15,23,42,.10);
}

.card.destaque {
  border-color: rgba(15,23,42,.22);
}

.foto-wrap {
  position: relative;

  width: 100%;

  aspect-ratio: 4 / 3;

  overflow: hidden;

  background: #e5e7eb;
}

.foto {
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;
}

.estrela-destaque {
  position: absolute;

  top: 12px;
  right: 12px;

  z-index: 3;

  width: 34px;
  height: 34px;

  border-radius: 999px;

  background: rgba(15,23,42,.72);

  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;

  backdrop-filter: blur(10px);
}

.card-body {
  padding: 13px 14px 15px;
}

.card-title {
  color: var(--texto);

  font-size: 15px;

  font-weight: 900;

  line-height: 1.18;

  letter-spacing: -.25px;

  margin-bottom: 5px;

  display: -webkit-box;

  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
}

.card-body .meta {
  color: var(--cinza);

  font-size: 12px;

  font-weight: 600;

  line-height: 1.3;
}

@media (max-width: 620px) {

  .grid,
  .grid-horizontal,
  .carousel-1linha {
    grid-auto-columns: minmax(220px, 72vw);

    gap: 12px;
  }

  .card {
    border-radius: 20px;
  }

  .card-body {
    padding: 12px;
  }

}
