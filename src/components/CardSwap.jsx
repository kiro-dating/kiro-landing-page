/* CardSwap — pile de cartes 3D auto-permutées (modèle react-bits).
   Version 100 % maison, AUCUNE dépendance à installer (pas de gsap) :
   même géométrie de slots, même chute élastique, même skew.
   - Slots : x = i·distX, y = -i·distY, z = -i·distX·1.5, zIndex = total - i
   - swap() : la carte de devant tombe (+500 px), les autres avancent d'un
     cran en cascade, puis elle remonte élastiquement au fond de la pile.
   - Pause au survol (pauseOnHover) et hors écran (IntersectionObserver).
   - prefers-reduced-motion : pile statique, aucune animation. */
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import './CardSwap.css';

export const Card = forwardRef(({ customClass, className, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`card ${customClass ?? ''} ${className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

/* Géométrie des slots — identique au modèle */
const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

/* Équivalent de elastic.out(0.6, 0.9) : sortie rapide + léger rebond doux */
const elasticOut = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const p = 0.9;
  return 2 ** (-10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
};

/* Timings du preset « elastic » du modèle */
const CONFIG = {
  durDrop: 2000,
  durMove: 2000,
  durReturn: 2000,
  promoteOverlap: 0.9,
  returnDelay: 0.05,
};

const CardSwap = ({
  width = 340,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = true,
  skewAmount = 6,
  children,
}) => {
  const containerRef = useRef(null);
  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    [childArr.length] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const container = containerRef.current;
    const els = refs.map((r) => r.current).filter(Boolean);
    const total = els.length;
    if (!container || total < 2) return undefined;

    const slot = (i) => makeSlot(i, cardDistance, verticalDistance, total);

    /* État de chaque carte (positions pilotées hors React, comme gsap.set) */
    const st = els.map((el, i) => ({ el, ...slot(i) }));
    const apply = (s) => {
      s.el.style.transform =
        `translate(-50%, -50%) translate3d(${s.x}px, ${s.y}px, ${s.z}px) skewY(${skewAmount}deg)`;
      s.el.style.zIndex = String(s.zIndex);
    };
    st.forEach(apply);

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined; /* pile statique, zéro animation */

    /* ── Mini moteur de tweens (remplace la timeline gsap) ── */
    const active = [];
    let raf = 0;
    const tick = (now) => {
      for (let i = active.length - 1; i >= 0; i -= 1) {
        const tw = active[i];
        const p = Math.min(1, (now - tw.t0) / tw.dur);
        tw.s[tw.key] = tw.from + (tw.to - tw.from) * elasticOut(p);
        if (p >= 1) active.splice(i, 1);
      }
      st.forEach(apply);
      raf = active.length ? window.requestAnimationFrame(tick) : 0;
    };
    const tween = (s, key, to, dur) => {
      for (let i = active.length - 1; i >= 0; i -= 1) {
        if (active[i].s === s && active[i].key === key) active.splice(i, 1);
      }
      active.push({ s, key, from: s[key], to, t0: performance.now(), dur });
      if (!raf) raf = window.requestAnimationFrame(tick);
    };

    const timers = new Set();
    const schedule = (fn, ms) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    /* ── swap() : même chorégraphie que la timeline du modèle ── */
    let order = st.map((_, i) => i);
    const swap = () => {
      const [front, ...rest] = order;
      const sF = st[front];
      const { durDrop, durMove, durReturn, promoteOverlap, returnDelay } = CONFIG;

      /* 1. La carte de devant tombe */
      tween(sF, 'y', sF.y + 500, durDrop);

      /* 2. Les autres montent d'un cran, en cascade */
      const promoteAt = durDrop * (1 - promoteOverlap);
      rest.forEach((idx, i) => {
        const target = slot(i);
        schedule(() => {
          st[idx].zIndex = target.zIndex;
          tween(st[idx], 'x', target.x, durMove);
          tween(st[idx], 'y', target.y, durMove);
          tween(st[idx], 'z', target.z, durMove);
        }, promoteAt + i * 150);
      });

      /* 3. La carte tombée file au fond puis remonte élastiquement */
      const back = slot(total - 1);
      schedule(() => {
        sF.zIndex = back.zIndex;
        sF.x = back.x;
        sF.z = back.z;
        tween(sF, 'y', back.y, durReturn);
      }, promoteAt + durMove * returnDelay);

      order = [...rest, front];
    };

    /* ── Cadence : première permutation immédiate puis toutes les `delay` ms.
         Pause au survol, hors écran ET quand l'onglet est caché (perf). ── */
    let interval = 0;
    let hovered = false;
    let visible = true;
    const sync = () => {
      const shouldRun = visible && !hovered && !document.hidden;
      if (shouldRun && !interval) {
        swap();
        interval = window.setInterval(swap, delay);
      } else if (!shouldRun && interval) {
        window.clearInterval(interval);
        interval = 0;
      }
    };
    sync();

    const onEnter = () => { hovered = true; sync(); };
    const onLeave = () => { hovered = false; sync(); };
    if (pauseOnHover) {
      container.addEventListener('mouseenter', onEnter);
      container.addEventListener('mouseleave', onLeave);
    }

    const onVisibility = () => sync();
    document.addEventListener('visibilitychange', onVisibility);

    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          sync();
        },
        { threshold: 0.05 }
      );
      io.observe(container);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearInterval(interval);
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      if (io) io.disconnect();
      if (pauseOnHover) {
        container.removeEventListener('mouseenter', onEnter);
        container.removeEventListener('mouseleave', onLeave);
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, refs]);

  return (
    <div
      ref={containerRef}
      className="card-swap-container"
      style={{ width, height }}
    >
      {childArr.map((child, i) =>
        isValidElement(child)
          ? cloneElement(child, {
              key: i,
              ref: refs[i],
              style: { width, height, ...(child.props.style ?? {}) },
            })
          : child
      )}
    </div>
  );
};

export default CardSwap;
