import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronDown, Info } from 'lucide-react';
import { Button } from './Button';
import { PhoneShowcase } from './PhoneShowcase';
import { trackEvent } from '../lib/analytics';
import './Hero.css';

/* ── Glaçons supplémentaires affichés pendant l'effet Freeze ──
   Positions en % du héros, tailles variées (petits et grands) */
const FREEZE_CUBES = [
  { left: '10%', top: '22%', size: 118, rot: -14, delay: 0 },
  { left: '17%', top: '57%', size: 86, rot: 10, delay: 0.12 },
  { left: '30%', top: '9%', size: 52, rot: 18, delay: 0.3 },
  { left: '46%', top: '86%', size: 66, rot: 22, delay: 0.22 },
  { left: '57%', top: '13%', size: 72, rot: -10, delay: 0.4 },
  { left: '65%', top: '66%', size: 58, rot: -18, delay: 0.18 },
  { left: '76%', top: '64%', size: 98, rot: 8, delay: 0.34 },
  { left: '87%', top: '38%', size: 62, rot: 16, delay: 0.46 },
  { left: '5%', top: '80%', size: 48, rot: -22, delay: 0.5 },
  { left: '93%', top: '78%', size: 80, rot: -6, delay: 0.28 },
];

const FREEZE_DURATION_MS = 6000;

/* Vrai sur les grands écrans (> 900 px). Sur mobile/tablette :
   pas de téléphone animé, pas d'animations d'entrée — le héros est instantané. */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 901px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

export const Hero = ({ onOpenTest, onOpenBeta }) => {
  const { t, i18n } = useTranslation();
  const isDesktop = useIsDesktop();
  const [scrollHidden, setScrollHidden] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const freezeTimer = useRef(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollHidden(window.scrollY > window.innerHeight * 0.45);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Effet Freeze : déclenché par le bouton gel du téléphone,
     dure ~6 s puis la page redevient normale */
  useEffect(() => {
    const onFreeze = () => {
      setFrozen(true);
      if (freezeTimer.current) clearTimeout(freezeTimer.current);
      freezeTimer.current = setTimeout(() => setFrozen(false), FREEZE_DURATION_MS);
    };
    window.addEventListener('kiro-freeze', onFreeze);
    return () => {
      window.removeEventListener('kiro-freeze', onFreeze);
      if (freezeTimer.current) clearTimeout(freezeTimer.current);
    };
  }, []);

  const scrollToConcept = () => {
    document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" aria-label="Kiro">
      {/* Glaçons décoratifs */}
      <img src="/icons/ice-cube.webp" alt="" aria-hidden="true" className="ice ice-1" draggable={false} />
      <img src="/icons/ice-cube.webp" alt="" aria-hidden="true" className="ice ice-2" draggable={false} />
      <img src="/icons/ice-cube.webp" alt="" aria-hidden="true" className="ice ice-3" draggable={false} />

      {/* ── Pluie de glaçons pendant le Freeze ── */}
      <AnimatePresence>
        {frozen &&
          FREEZE_CUBES.map((c, i) => (
            <m.img
              key={`fz-${i}`}
              src="/icons/ice-cube.webp"
              alt=""
              aria-hidden="true"
              className="freeze-ice"
              draggable={false}
              style={{ left: c.left, top: c.top, width: c.size }}
              initial={{ opacity: 0, scale: 0.2, y: -46, rotate: c.rot - 24 }}
              animate={{
                opacity: [0, 1, 1],
                scale: 1,
                y: [-46, 0, -7, 0],
                rotate: c.rot,
              }}
              exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.55 } }}
              transition={{
                duration: 1.1,
                delay: c.delay,
                ease: [0.2, 0.9, 0.3, 1.2],
              }}
            />
          ))}
      </AnimatePresence>

      <div className="container hero-grid">
        {/* Téléphone : réservé aux grands écrans — jamais monté sur mobile
            (aucune photo de profil chargée, aucun JS d'animation) */}
        {isDesktop && (
          <m.div
            className="hero-visual"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <PhoneShowcase />
          </m.div>
        )}

        <m.div
          className="hero-copy"
          key={i18n.language}
          initial={isDesktop ? { opacity: 0, y: 22 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="wordmark-row">
            <img
              src="/images/kiro-wordmark.webp"
              alt="Kiro"
              className="hero-wordmark"
              width="900"
              height="359"
              draggable={false}
            />
            {/* ── Texte Freeze glacé, à côté du logo ── */}
            <AnimatePresence>
              {frozen && (
                <m.span
                  className="freeze-badge"
                  initial={{ opacity: 0, x: -18, scale: 0.7, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.85, filter: 'blur(6px)', transition: { duration: 0.5 } }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                >
                  <span className="freeze-flake" aria-hidden="true">❄</span>
                  Freeze
                </m.span>
              )}
            </AnimatePresence>
          </div>
          <h1>
            {t('hero.tagline_1')}
            <br />
            <span className="accent">{t('hero.tagline_2')}</span>
          </h1>
          <p className="hero-sub">{t('hero.secondary')}</p>

          <div className="hero-ctas">
            <Button
              onClick={() => {
                trackEvent('test_kiro_click', { event_category: 'engagement', event_label: 'Hero' });
                onOpenTest();
              }}
            >
              {t('hero.cta_test')} <ArrowRight size={18} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                trackEvent('learn_more_click', { event_category: 'engagement', event_label: 'Hero' });
                onOpenBeta();
              }}
            >
              <Info size={18} /> {t('hero.cta_more')}
            </Button>
          </div>
        </m.div>
      </div>

      <button
        className={`hero-scroll ${scrollHidden ? 'is-hidden' : ''}`}
        onClick={scrollToConcept}
        aria-label={t('hero.scroll')}
      >
        <ChevronDown size={22} />
      </button>
    </section>
  );
};
