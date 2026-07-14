/* Galerie circulaire — version 100 % CSS/DOM, AUCUNE dépendance à installer.
   Même effet que la version WebGL : cartes sur un arc, défilement infini,
   drag à la souris, balayage tactile, flèches clavier, auto-défilement doux.
   La boucle d'animation se met en pause quand la galerie sort de l'écran. */
import { useEffect, useRef } from 'react';
import './CircularGallery.css';

export default function CircularGallery({
  items = [],
  bend = 2.2,
  scrollSpeed = 2,
  scrollEase = 0.07,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !items.length) return undefined;

    /* Boucle infinie : avec beaucoup de cartes, une seule série suffit
       (moitié moins de nœuds et de mémoire de décodage) */
    const doubled = items.length >= 12 ? items : items.concat(items);

    /* Construction du DOM des cartes */
    const cards = doubled.map((item) => {
      const card = document.createElement('div');
      card.className = 'cg-card';
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.draggable = false;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.fetchPriority = 'low';
      img.width = 480;
      img.height = 640;
      const label = document.createElement('span');
      label.className = 'cg-label';
      label.textContent = item.text;
      card.appendChild(img);
      card.appendChild(label);
      container.appendChild(card);
      return card;
    });

    let W = 0;
    let H = 0;
    let B = 1;
    let cardW = 0;
    let step = 0;
    let total = 0;

    const measure = () => {
      W = container.clientWidth;
      H = container.clientHeight;
      /* Courbure PROGRESSIVE : pleine à ≥ 1440 px, elle diminue à mesure
         que l'écran rétrécit (≈ moitié sur iPad) et devient NULLE sous
         680 px : sur téléphone, cartes droites, une photo à la fois */
      const t = Math.min(1, Math.max(0, (W - 680) / 760));
      const bendCur = bend * t;
      B = Math.max(1, H * bendCur * 0.14);
      /* Téléphone : carte large et droite, les voisines dépassent aux bords */
      cardW = W < 680 ? Math.min(320, W * 0.62) : Math.min(300, Math.max(190, W * 0.26));
      /* Carte + libellé + descente maximale de l'arc (= B) doivent tenir
         dans le conteneur : plus aucune coupe en bas */
      const ratio = W < 680 ? 1.25 : 1.3;
      const cardH = Math.min(H * 0.78, cardW * ratio, H - B - 74);
      step = cardW + Math.max(28, W * 0.03);
      total = step * doubled.length;
      cards.forEach((card) => {
        card.style.width = `${cardW}px`;
        card.style.height = `${cardH}px`;
      });
    };
    measure();

    const state = {
      current: 0,
      target: 0,
      down: false,
      startX: 0,
      startTarget: 0,
      visible: true,
      raf: 0,
    };

    /* Mouvement réduit demandé : pas d'auto-défilement (drag/flèches restent actifs) */
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      state.current += (state.target - state.current) * scrollEase;
      /* Auto-défilement très doux quand on ne touche pas */
      if (!state.down && !reducedMotion) state.target += 0.35;

      const half = W / 2;
      const R = (half * half + B * B) / (2 * B);

      for (let i = 0; i < cards.length; i += 1) {
        /* Position bouclée à l'infini */
        let pos = (i * step - state.current) % total;
        if (pos < 0) pos += total;
        const x = pos - total / 2 + half - cardW / 2;
        const dx = x + cardW / 2 - half;
        const eff = Math.min(Math.abs(dx), half);
        const arc = R - Math.sqrt(Math.max(R * R - eff * eff, 0));
        const rot = -Math.sign(dx) * Math.asin(eff / R);
        const hidden = Math.abs(dx) > half + cardW;
        cards[i].style.visibility = hidden ? 'hidden' : 'visible';
        if (!hidden) {
          cards[i].style.transform = `translate3d(${x}px, ${arc}px, 0) rotate(${rot}rad)`;
        }
      }
      if (state.visible) state.raf = window.requestAnimationFrame(render);
    };
    state.raf = window.requestAnimationFrame(render);

    /* ── Interactions ──
       Les écouteurs globaux (mousemove/mouseup) ne sont attachés QUE
       pendant un drag : zéro travail au repos. */
    const getX = (e) => ('touches' in e ? e.touches[0].clientX : e.clientX);
    const onMove = (e) => {
      if (!state.down) return;
      state.target = state.startTarget + (state.startX - getX(e)) * (scrollSpeed * 0.9);
    };
    const onUp = () => {
      state.down = false;
      container.classList.remove('is-grabbing');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    const onDown = (e) => {
      state.down = true;
      state.startX = getX(e);
      state.startTarget = state.target;
      container.classList.add('is-grabbing');
      if (!('touches' in e)) {
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      }
    };
    const onTouchEnd = () => {
      state.down = false;
      container.classList.remove('is-grabbing');
    };
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        state.target += step;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        state.target -= step;
      }
    };

    container.addEventListener('mousedown', onDown);
    container.addEventListener('touchstart', onDown, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('keydown', onKey);
    window.addEventListener('resize', measure);

    /* Pause hors écran (perf) */
    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const vis = entries[0].isIntersecting;
          if (vis && !state.visible) {
            state.visible = true;
            state.raf = window.requestAnimationFrame(render);
          } else if (!vis) {
            state.visible = false;
            window.cancelAnimationFrame(state.raf);
          }
        },
        { threshold: 0.05 }
      );
      io.observe(container);
    }

    return () => {
      window.cancelAnimationFrame(state.raf);
      if (io) io.disconnect();
      container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      container.removeEventListener('touchstart', onDown);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', measure);
      cards.forEach((card) => card.remove());
    };
  }, [items, bend, scrollSpeed, scrollEase]);

  return (
    <div
      className="circular-gallery"
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Galerie de lieux Kiro. Utilisez les flèches gauche et droite pour naviguer."
    />
  );
}
