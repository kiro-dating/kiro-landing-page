import React, { useRef, useState, useEffect } from 'react';
import { m, useScroll, useTransform, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Brain, CalendarCheck, MessageCircle,
  Gamepad2, HelpCircle, Zap, Calendar,
  MapPin, ShieldCheck, Music, PartyPopper, Compass,
  Send, Play, ArrowRight,
  Leaf, Flame, Crown, Gem,
} from 'lucide-react';
import { Button } from './Button';
import CardSwap, { Card } from './CardSwap';
import { trackEvent } from '../lib/analytics';
import './Sections.css';

const Head = ({ eyebrow, title, desc, center }) => (
  <div className={center ? 'section-head-center' : ''}>
    <p className="section-eyebrow">{eyebrow}</p>
    <h2 className="section-title">{title}</h2>
    {desc && <p className="section-desc">{desc}</p>}
  </div>
);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

/* ── 2. Concept ── */
const conceptStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.35 } },
};

export const Concept = () => {
  const { t } = useTranslation();
  const points = [
    { n: 1, icon: <Brain size={22} /> },
    { n: 2, icon: <MapPin size={22} /> },
    { n: 3, icon: <Gamepad2 size={22} /> },
    { n: 4, icon: <CalendarCheck size={22} /> },
  ];
  return (
    <section id="concept" className="section s-concept">
      <div className="section-inner concept-split">
        {/* Colonne gauche : l'histoire (apparaît en premier) */}
        <m.div
          className="concept-story"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="section-eyebrow">{t('concept.eyebrow')}</p>
          <h2 className="section-title">{t('concept.title')}</h2>
          <p className="concept-intro">{t('concept.intro')}</p>
          <blockquote className="concept-quote">{t('concept.quote')}</blockquote>
        </m.div>

        {/* Colonne droite : les 4 piliers (apparition décalée, un par un) */}
        <m.ul
          className="concept-points"
          variants={conceptStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {points.map(({ n, icon }) => (
            <m.li key={n} variants={rise}>
              <span className="concept-icon" aria-hidden="true">{icon}</span>
              <div>
                <strong>{t(`concept.point${n}_title`)}</strong>
                <span>{t(`concept.point${n}_desc`)}</span>
              </div>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  );
};

/* ── 3. Jeux — pile de cartes empilées au défilement ── */
const GAME_CARDS = [
  { key: 'game1', className: 'gc-rose' },
  { key: 'game2', className: 'gc-ink' },
  { key: 'game3', className: 'gc-mint' },
  { key: 'game4', className: 'gc-red' },
];

/* Illustrations légères, 100 % CSS/SVG — aucune image à charger */
const GameIllustration = ({ index }) => {
  if (index === 0) {
    return (
      <div className="gi gi-match5" aria-hidden="true">
        <div className="compat-ring">
          <span>87%</span>
        </div>
        <div className="q-dots">
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} className={n <= 4 ? 'on' : ''} />
          ))}
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="gi gi-tod" aria-hidden="true">
        <i className="tod-orbit" />
        <div className="tod-card tod-a">
          <Zap size={34} fill="currentColor" strokeWidth={1.5} />
          <b className="tod-shine">✦</b>
        </div>
        <div className="tod-card tod-v">
          <MessageCircle size={34} strokeWidth={1.8} />
        </div>
        <b className="tod-spark ts-1">✦</b>
        <b className="tod-spark ts-2">✦</b>
        <b className="tod-spark ts-3">✦</b>
        <i className="tod-dot" />
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="gi gi-guess" aria-hidden="true">
        <span>3</span>
        <span>7</span>
        <span className="mystery">?</span>
        <span>9</span>
      </div>
    );
  }
  return (
    <div className="gi gi-date" aria-hidden="true">
      <div className="date-cal"><CalendarCheck size={30} /></div>
      <div className="date-bar">
        <i />
        <span>70%</span>
      </div>
    </div>
  );
};

/* Carte de la pile : entre par le bas puis se pose sous la précédente.
   Tout le bloc (en-tête + cartes) est UN SEUL élément épinglé : quand la
   dernière carte est posée, le défilement se libère et tout part ensemble
   — plus aucune carte ne glisse sous le paragraphe. */
const STEP = 460; /* distance de défilement par carte (grand écran) */

const GameCard = ({ index, total, progress, yStart, step, className, children }) => {
  const travel = step * (total - 1);
  const startP = ((index - 1) * step) / travel;
  const dockP = (index * step) / travel;
  const y = useTransform(
    progress,
    index === 0 ? [0, 1] : [Math.max(0, startP), Math.min(1, dockP)],
    index === 0 ? [0, 0] : [yStart, index * 24]
  );
  const scale = useTransform(progress, [Math.min(0.999, dockP), 1], [1, 1 - (total - 1 - index) * 0.045]);
  return (
    <m.div className={`game-card ${className}`} style={{ y, scale, zIndex: index + 1 }}>
      {children}
    </m.div>
  );
};

/* Pile animée sur TOUTES les tailles d'écran (les cartes sont compactées
   sur mobile) — liste simple uniquement en « mouvement réduit » */
const useStackEnabled = () => {
  const query = '(prefers-reduced-motion: no-preference)';
  const [on, setOn] = useState(
    () => typeof window === 'undefined' || window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setOn(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return on;
};

const GameCardContent = ({ i, gKey, t }) => {
  /* Mobile : description repliée sur 3 lignes + bouton « Voir plus » */
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={`game-copy ${open ? 'is-open' : ''}`}>
        <span className="game-num">{String(i + 1).padStart(2, '0')}</span>
        <h3>{t(`games.${gKey}_title`)}</h3>
        <p>{t(`games.${gKey}_text`)}</p>
        <button type="button" className="game-more" onClick={() => setOpen(!open)}>
          {open ? t('games.less') : t('games.more')}
        </button>
      </div>
      <GameIllustration index={i} />
    </>
  );
};

/* Mobile : liste simple — aucun hook de scroll, aucune animation */
const GamesList = () => {
  const { t } = useTranslation();
  return (
    <section id="jeux" className="section s-games">
      <div className="section-inner">
        <Head eyebrow={t('games.eyebrow')} title={t('games.title')} desc={t('games.desc')} center />
        <div className="games-list">
          {GAME_CARDS.map((g, i) => (
            <div key={g.key} className={`game-card ${g.className}`}>
              <GameCardContent i={i} gKey={g.key} t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* Desktop : pile animée pilotée par le défilement */
const GamesStack = () => {
  const { t } = useTranslation();
  const driverRef = useRef(null);
  const pinRef = useRef(null);
  const cardsRef = useRef(null);
  const [pinHeight, setPinHeight] = useState(760);
  const [cardAreaH, setCardAreaH] = useState(500);
  const [yStart, setYStart] = useState(700);
  const [stepLen, setStepLen] = useState(460);
  /* La progression se termine quand le bas du driver atteint le bas du
     bloc épinglé (76 px de nav + hauteur du bloc + petite marge) — et non
     le bas de l'écran : sur les écrans peu hauts, la dernière carte est
     ainsi TOUJOURS posée avant que le bloc ne soit relâché. */
  const { scrollYProgress } = useScroll({
    target: driverRef,
    offset: ['start start', `end ${pinHeight + 124}px`],
  });

  /* Mesures : hauteur de la plus grande carte (zone), du bloc épinglé,
     et point de départ hors écran des cartes qui montent */
  useEffect(() => {
    const cardsEl = cardsRef.current;
    const pinEl = pinRef.current;
    if (!cardsEl || !pinEl || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      const cards = Array.from(cardsEl.children);
      const maxH = Math.max(400, ...cards.map((c) => c.offsetHeight));
      setCardAreaH(maxH + (cards.length - 1) * 24);
      setPinHeight(pinEl.offsetHeight);
      setYStart(Math.max(420, window.innerHeight));
      /* Pas plus court sur mobile : l'empilement reste vif */
      setStepLen(window.innerWidth < 641 ? 360 : STEP);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(pinEl);
    Array.from(cardsEl.children).forEach((c) => ro.observe(c));
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /* Longueur de défilement : 3 cartes × STEP + petite marge après la pose */
  const driverHeight = pinHeight + stepLen * (GAME_CARDS.length - 1) + 24;

  return (
    <section id="jeux" className="section s-games">
      <div className="section-inner">
        <div className="games-driver" ref={driverRef} style={{ height: `${driverHeight}px` }}>
          <div className="games-pin" ref={pinRef}>
            <Head eyebrow={t('games.eyebrow')} title={t('games.title')} desc={t('games.desc')} center />
            <div className="games-cards" ref={cardsRef} style={{ height: `${cardAreaH}px` }}>
              {GAME_CARDS.map((g, i) => (
                <GameCard
                  key={g.key}
                  index={i}
                  total={GAME_CARDS.length}
                  progress={scrollYProgress}
                  yStart={yStart}
                  step={stepLen}
                  className={g.className}
                >
                  <GameCardContent i={i} gKey={g.key} t={t} />
                </GameCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Games = () => (useStackEnabled() ? <GamesStack /> : <GamesList />);

/* ── Démo de chat : verrou narratif intelligent ──
   Règles :
   1. Passage rapide → rien ne se joue, le scroll n'est jamais touché.
   2. L'utilisateur s'attarde ≥ 1 s sur la section → le scroll se verrouille,
      la conversation se joue, puis le scroll se libère.
   3. Le verrou n'arrive qu'UNE SEULE FOIS (mémorisé dans le navigateur) :
      aux visites suivantes l'animation se rejoue, mais sans jamais bloquer.
   4. Mouvement réduit / navigateur limité → conversation affichée d'un coup. */
const CHAT_SCRIPT = [
  { key: 'msg1', side: 'in', typing: 1000 },
  { key: 'msg2', side: 'out', typing: 1000 },
  { key: 'msg3', side: 'in', typing: 1300 },
  { key: 'msg4', side: 'out', typing: 1300 },
  { key: 'msg5', side: 'in', typing: 1300 },
];

const CHAT_PLAYED_KEY = 'kiro-chat-played';
const DWELL_MS = 1000; /* temps d'arrêt requis avant de jouer */

export const ChatDemo = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setStep(CHAT_SCRIPT.length);
      return undefined;
    }

    const timers = [];
    let dwellTimer = 0;
    const unlock = () => {
      document.body.style.overflow = '';
    };
    const alreadyPlayed = () => {
      try {
        return window.localStorage.getItem(CHAT_PLAYED_KEY) === '1';
      } catch {
        return true; /* stockage indisponible : ne jamais bloquer */
      }
    };
    const markPlayed = () => {
      try {
        window.localStorage.setItem(CHAT_PLAYED_KEY, '1');
      } catch {
        /* silencieux */
      }
    };

    const play = (i) => {
      if (i >= CHAT_SCRIPT.length) {
        setTyping(null);
        unlock(); /* dernière bulle : le défilement reprend */
        return;
      }
      setTyping(CHAT_SCRIPT[i].side);
      timers.push(
        setTimeout(() => {
          setTyping(null);
          setStep(i + 1);
          timers.push(setTimeout(() => play(i + 1), 420));
        }, CHAT_SCRIPT[i].typing)
      );
    };

    const start = () => {
      playedRef.current = true;
      io.disconnect();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setStep(CHAT_SCRIPT.length);
        return;
      }

      if (alreadyPlayed()) {
        /* Déjà vécu : on rejoue la scène, sans toucher au scroll */
        timers.push(setTimeout(() => play(0), 350));
        return;
      }

      /* Toute première fois : on mémorise tout de suite (même si la page
         est rechargée en cours de route, le verrou ne reviendra plus) */
      markPlayed();
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      timers.push(
        setTimeout(() => {
          document.body.style.overflow = 'hidden';
        }, 450)
      );
      timers.push(setTimeout(() => play(0), 700));
      /* Filets de sécurité : déverrouille quoi qu'il arrive */
      timers.push(setTimeout(unlock, 12000));
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (playedRef.current) return;
        if (entries[0].isIntersecting) {
          /* Il faut RESTER 1 s sur la section : un passage rapide ne compte pas */
          if (!dwellTimer) dwellTimer = window.setTimeout(start, DWELL_MS);
        } else if (dwellTimer) {
          window.clearTimeout(dwellTimer);
          dwellTimer = 0;
        }
      },
      { threshold: 0.55 }
    );
    io.observe(el);

    /* Onglet caché pendant le verrou : on libère immédiatement */
    const onHide = () => {
      if (document.hidden) unlock();
    };
    document.addEventListener('visibilitychange', onHide);

    return () => {
      io.disconnect();
      if (dwellTimer) window.clearTimeout(dwellTimer);
      timers.forEach(clearTimeout);
      document.removeEventListener('visibilitychange', onHide);
      unlock();
    };
  }, []);

  return (
    <section id="chat-demo" className="section s-translate s-chatlock" ref={ref}>
      <div className="section-inner translate-grid">
        <div>
          <Head eyebrow={t('chatdemo.eyebrow')} title={t('chatdemo.title')} desc={t('chatdemo.desc')} />
        </div>
        <div className="chat-demo" aria-hidden="true">
          {CHAT_SCRIPT.slice(0, step).map((msg) => (
            <m.div
              key={msg.key}
              className={`chat-bubble ${msg.side}`}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              {t(`chatdemo.${msg.key}`)}
            </m.div>
          ))}
          {typing && (
            <m.div
              key={`typing-${step}`}
              className={`chat-bubble chat-typing ${typing}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <i />
              <i />
              <i />
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ── 9. Abonnements — pile CardSwap ── */
export const Plans = () => {
  const { t } = useTranslation();
  const plans = [
    { key: 'free', name: t('plans.free_name'), desc: t('plans.free_desc'), icon: <Leaf size={15} /> },
    { key: 'standard', name: t('plans.standard_name'), desc: t('plans.standard_desc'), featured: true, badge: t('plans.popular'), icon: <Flame size={15} /> },
    { key: 'premium', name: t('plans.premium_name'), desc: t('plans.premium_desc'), icon: <Crown size={15} /> },
    { key: 'max', name: t('plans.max_name'), desc: t('plans.max_desc'), icon: <Gem size={15} /> },
  ];
  return (
    <section id="abonnements" className="section s-plans">
      <div className="section-inner plans-split">
        <m.div
          className="plans-copy"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Head eyebrow={t('plans.eyebrow')} title={t('plans.title')} desc={t('plans.desc')} />
          <ul className="plans-chips">
            {plans.map((p) => (
              <li key={p.key} className={`plans-chip tier-${p.key}`}>
                {p.icon} {p.name}
              </li>
            ))}
          </ul>
        </m.div>

        <m.div
          className="plans-visual"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <CardSwap width={440} height={400} cardDistance={72} verticalDistance={82} delay={4500} skewAmount={5}>
            {plans.map((p) => (
              <Card key={p.key} customClass={`plan-card tier-${p.key}`}>
                <div className="plan-card-top">
                  {p.icon}
                  <span>{p.name}</span>
                  {p.badge && <em className="plan-pop">{p.badge}</em>}
                </div>
                <div className="plan-card-body">
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                </div>
              </Card>
            ))}
          </CardSwap>
        </m.div>
      </div>
    </section>
  );
};

/* ── 10. CTA final ── */
export const FinalCta = ({ onOpenTest, onOpenBeta }) => {
  const { t } = useTranslation();
  return (
    <section id="tester" className="section s-cta">
      <div className="section-inner cta-final">
        <h2 className="section-title">{t('cta.title')}</h2>
        <p className="section-desc" style={{ marginInline: 'auto' }}>{t('cta.desc')}</p>
        <div className="cta-buttons">
          <Button
            onClick={() => {
              trackEvent('telegram_cta_click', { event_category: 'conversion', event_label: 'Final CTA' });
              onOpenTest();
            }}
          >
            <Send size={18} /> {t('cta.btn_telegram')}
          </Button>
          <Button
            variant="dark"
            onClick={() => {
              trackEvent('beta_cta_click', { event_category: 'conversion', event_label: 'Final CTA' });
              onOpenBeta();
            }}
          >
            <Play size={18} /> {t('cta.btn_beta')} <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};
