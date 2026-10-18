import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Brain, MapPin, Gamepad2, CalendarCheck,
  Coffee, Dumbbell, Music, Zap, MessageCircle, Check,
} from 'lucide-react';
import './ConceptStory.css';

/* ════════════════════════════════════════════════════════════════════
   Le Concept — quatre chapitres d'un même parcours.

   Ce n'est pas une liste de fonctionnalités : c'est une table des
   matières interactive. Un seul chapitre est monté à la fois ; la
   navigation reprend la mécanique du LineSidebar de React Bits (index,
   trait qui s'allonge sur l'élément actif, léger décalage des voisins
   à l'approche du curseur) mais habillée aux couleurs de Kiro.
   Aucune lecture automatique : c'est l'utilisateur qui explore.
   ════════════════════════════════════════════════════════════════════ */

const CHAPTERS = [1, 2, 3, 4];

/* Alias explicite : la configuration ESLint du projet n'inclut pas
   eslint-plugin-react et ne voit donc pas les usages en JSX. Passer par
   une constante rend l'utilisation de `m` visible pour le linter. */
const MotionPanel = m.div;

/* ── Préférences système ─────────────────────────────────────────── */

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    /* L'initialiseur paresseux ci-dessus a déjà lu la valeur courante :
       l'effet se contente de s'abonner aux changements. */
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

/* Décalage de proximité : les entrées proches du curseur glissent
   légèrement vers la droite, avec un amortissement. Réservé aux
   pointeurs précis et désactivé en mouvement réduit — c'est un
   agrément, jamais un porteur d'information. */
const MAX_SHIFT = 13;
const RADIUS = 118;

const useProximityShift = (enabled) => {
  const listRef = useRef(null);
  const itemsRef = useRef([]);
  const targets = useRef([]);
  const values = useRef([]);
  const frame = useRef(0);

  const setItem = useCallback((index) => (node) => {
    itemsRef.current[index] = node;
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    const items = () => itemsRef.current.filter(Boolean);

    if (!enabled) {
      items().forEach((el) => el.style.setProperty('--cs-shift', '0px'));
      return undefined;
    }

    const tick = () => {
      let moving = false;
      items().forEach((el, i) => {
        const to = targets.current[i] || 0;
        const from = values.current[i] || 0;
        const next = from + (to - from) * 0.16;
        values.current[i] = Math.abs(to - next) < 0.05 ? to : next;
        if (values.current[i] !== to) moving = true;
        el.style.setProperty('--cs-shift', `${values.current[i].toFixed(2)}px`);
      });
      frame.current = moving ? requestAnimationFrame(tick) : 0;
    };
    const start = () => { if (!frame.current) frame.current = requestAnimationFrame(tick); };

    const onMove = (event) => {
      items().forEach((el, i) => {
        const box = el.getBoundingClientRect();
        const distance = Math.abs(event.clientY - (box.top + box.height / 2));
        /* Amortissement doux (cosinus) plutôt que linéaire :
           le glissement s'éteint sans cassure au bord du rayon. */
        const ratio = Math.min(distance / RADIUS, 1);
        targets.current[i] = MAX_SHIFT * (0.5 + Math.cos(ratio * Math.PI) / 2);
      });
      start();
    };
    const onLeave = () => { targets.current = []; start(); };

    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', onLeave);
    return () => {
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeave);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [enabled]);

  return { listRef, setItem };
};

/* ── Mises en scène ───────────────────────────────────────────────
   Purement décoratives (aria-hidden) : tout le sens est porté par le
   titre et le texte du chapitre, donc rien ici n'a besoin d'être
   traduit. Même vocabulaire graphique que les illustrations de la
   section Jeux (anneaux, pastilles, points, étincelles). */

const PENTAGON = Array.from({ length: 5 }, (_, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return { x: Math.cos(angle), y: Math.sin(angle) };
});

const polygon = (weights, radius, cx, cy) =>
  PENTAGON.map((p, i) => `${(cx + p.x * radius * weights[i]).toFixed(1)},${(cy + p.y * radius * weights[i]).toFixed(1)}`).join(' ');

const SceneOne = () => (
  <div className="cs-fig cs-fig-1" aria-hidden="true">
    {/* Le graphe et sa légende forment un bloc : la pastille reste
        accrochée au radar quelle que soit la largeur de la colonne. */}
    <div className="cs-radar-wrap">
    <svg viewBox="0 0 200 200" className="cs-radar">
      {[1, 0.72, 0.44].map((r) => (
        <polygon key={r} className="cs-radar-web" points={polygon([1, 1, 1, 1, 1], 72 * r, 100, 100)} />
      ))}
      {PENTAGON.map((p, i) => (
        <line key={i} className="cs-radar-web" x1="100" y1="100" x2={100 + p.x * 72} y2={100 + p.y * 72} />
      ))}
      <polygon className="cs-radar-b" points={polygon([0.78, 0.86, 0.7, 0.74, 0.92], 72, 100, 100)} />
      <polygon className="cs-radar-a" points={polygon([0.94, 0.68, 0.88, 0.6, 0.8], 72, 100, 100)} />
      {PENTAGON.map((p, i) => (
        <circle key={i} className="cs-radar-dot" cx={100 + p.x * 72} cy={100 + p.y * 72} r="3.2" />
      ))}
    </svg>
      <div className="cs-affinity">
        <span className="cs-affinity-value">92<i>%</i></span>
        <span className="cs-affinity-tag">Big Five</span>
      </div>
    </div>
  </div>
);

const PLACE_ICONS = [<Coffee key="c" size={17} />, <Dumbbell key="d" size={17} />, <Music key="m" size={17} />];

const SceneTwo = () => (
  <div className="cs-fig cs-fig-2" aria-hidden="true">
    <div className="cs-map">
      <i className="cs-map-road cs-road-1" />
      <i className="cs-map-road cs-road-2" />
      <i className="cs-map-road cs-road-3" />
      <span className="cs-pin cs-pin-a"><MapPin size={15} /></span>
      <span className="cs-pin cs-pin-b"><MapPin size={15} /></span>
      <span className="cs-pin cs-pin-live">
        <i className="cs-pin-halo" />
        <MapPin size={19} />
      </span>
    </div>
    <div className="cs-chips">
      {PLACE_ICONS.map((icon, i) => (
        <span key={i} className={`cs-chip${i === 0 ? ' is-on' : ''}`}>{icon}</span>
      ))}
    </div>
  </div>
);

const SceneThree = () => (
  <div className="cs-fig cs-fig-3" aria-hidden="true">
    <div className="cs-ask">
      <span className="cs-ask-dots"><i /><i /><i /></span>
      <span className="cs-ask-line" />
      <span className="cs-ask-line cs-short" />
    </div>
    <div className="cs-opts">
      <span className="cs-opt cs-opt-a"><Zap size={18} strokeWidth={2.1} /></span>
      <span className="cs-opt cs-opt-b"><MessageCircle size={18} strokeWidth={2.1} /></span>
    </div>
    <b className="cs-spark cs-spark-1">✦</b>
    <b className="cs-spark cs-spark-2">✦</b>
  </div>
);

const SLOTS = [0, 1, 2, 3, 4, 5];
const FREE_A = [1, 3, 4];
const FREE_B = [0, 3, 5];

const SceneFour = () => (
  <div className="cs-fig cs-fig-4" aria-hidden="true">
    <div className="cs-place">
      <span className="cs-place-pin"><MapPin size={15} /></span>
      <span className="cs-place-line" />
    </div>
    <div className="cs-tracks">
      {[FREE_A, FREE_B].map((free, row) => (
        <div className="cs-track" key={row}>
          {SLOTS.map((s) => (
            <i key={s} className={`${free.includes(s) ? 'is-free' : ''}${s === 3 ? ' is-match' : ''}`} />
          ))}
        </div>
      ))}
      <span className="cs-match-beam" />
    </div>
    <span className="cs-booked"><CalendarCheck size={16} /><Check size={13} className="cs-booked-tick" /></span>
  </div>
);

const SCENES = [SceneOne, SceneTwo, SceneThree, SceneFour];
const NAV_ICONS = [Brain, MapPin, Gamepad2, CalendarCheck];

/* ── Section ──────────────────────────────────────────────────────── */

export const Concept = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  const compact = useMediaQuery('(max-width: 900px)');
  const stillness = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const { listRef, setItem } = useProximityShift(finePointer && !stillness && !compact);

  const tabsRef = useRef([]);

  const go = useCallback((index) => {
    const next = (index + CHAPTERS.length) % CHAPTERS.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  }, []);

  const onKeyDown = (event) => {
    const map = {
      ArrowDown: active + 1, ArrowRight: active + 1,
      ArrowUp: active - 1, ArrowLeft: active - 1,
      Home: 0, End: CHAPTERS.length - 1,
    };
    if (!(event.key in map)) return;
    event.preventDefault();
    go(map[event.key]);
  };

  /* Mobile : la puce active reste visible dans la barre défilante.
     On fait défiler UNIQUEMENT la barre, horizontalement : scrollIntoView()
     faisait aussi défiler la page verticalement, si bien que le site
     s'ouvrait déjà descendu d'environ 170 px sur téléphone. */
  useEffect(() => {
    if (!compact) return;
    const tab = tabsRef.current[active];
    const strip = tab?.closest('.cs-nav');
    if (!tab || !strip) return;
    const tabBox = tab.getBoundingClientRect();
    const stripBox = strip.getBoundingClientRect();
    const left = strip.scrollLeft + (tabBox.left - stripBox.left)
      - (strip.clientWidth - tabBox.width) / 2;
    strip.scrollTo({ left, behavior: stillness ? 'auto' : 'smooth' });
  }, [active, compact, stillness]);

  const Scene = SCENES[active];
  const n = active + 1;

  const motionProps = useMemo(() => (stillness
    ? { initial: false, animate: {}, exit: {}, transition: { duration: 0 } }
    : {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -6 },
      transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
    }), [stillness]);

  return (
    <section id="concept" className="section s-concept">
      <div className="section-inner">
        <header className="cs-head">
          <p className="section-eyebrow">{t('concept.eyebrow')}</p>
          <h2 className="section-title cs-title">{t('concept.title')}</h2>
          <p className="cs-intro">{t('concept.intro')}</p>
        </header>

        <div className="cs-stage">
          {/* ── Table des matières ── */}
          <div
            className="cs-nav"
            role="tablist"
            aria-orientation={compact ? 'horizontal' : 'vertical'}
            aria-label={t('concept.eyebrow')}
            ref={listRef}
            onKeyDown={onKeyDown}
          >
            {CHAPTERS.map((c, i) => {
              const on = i === active;
              const Icon = NAV_ICONS[i];
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  id={`cs-tab-${c}`}
                  aria-selected={on}
                  aria-controls={`cs-panel-${c}`}
                  tabIndex={on ? 0 : -1}
                  className={`cs-step${on ? ' is-active' : ''}`}
                  ref={(node) => {
                    tabsRef.current[i] = node;
                    setItem(i)(node);
                  }}
                  onClick={() => setActive(i)}
                >
                  <span className="cs-rule" aria-hidden="true" />
                  <span className="cs-step-num">{String(c).padStart(2, '0')}</span>
                  <span className="cs-step-label">{t(`concept.step${c}`)}</span>
                  <Icon className="cs-step-icon" size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {/* ── Scène du chapitre actif ── */}
          <div className="cs-scene">
            <AnimatePresence mode="wait" initial={false}>
              <MotionPanel
                key={active}
                role="tabpanel"
                id={`cs-panel-${n}`}
                aria-labelledby={`cs-tab-${n}`}
                tabIndex={0}
                className="cs-panel"
                {...motionProps}
              >
                <div className="cs-panel-copy">
                  <p className="cs-panel-count">
                    <span>{String(n).padStart(2, '0')}</span> / {String(CHAPTERS.length).padStart(2, '0')}
                  </p>
                  <h3 className="cs-panel-title">{t(`concept.point${n}_title`)}</h3>
                  <p className="cs-panel-desc">{t(`concept.point${n}_desc`)}</p>
                </div>
                <Scene />
              </MotionPanel>
            </AnimatePresence>
          </div>
        </div>

        <p className="cs-signature">{t('concept.quote')}</p>
      </div>
    </section>
  );
};

export default Concept;
