import React, { useRef, useState } from 'react';
import { m } from 'framer-motion';
import { trackEvent } from '../lib/analytics';
import Stack from './Stack';
import './PhoneShowcase.css';

/* ── Icônes d'action recréées en SVG (fidèles à l'app) ── */

const RewindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 5a7 7 0 1 1-6.32 4"
      stroke="#7a4ff0"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M7.4 3.2 5 9l6-.6z" fill="#7a4ff0" />
  </svg>
);

const FreezeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="#4fd4f2" strokeWidth="1.7" strokeLinecap="round">
    <path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5" />
    <path d="M12 2.5 9.8 4.7M12 2.5l2.2 2.2M12 21.5l-2.2-2.2M12 21.5l2.2-2.2" />
    <path d="M3.8 7.25 6.8 7 5.6 4.2M20.2 16.75l-3-.25 1.2 2.8M3.8 16.75l3 .25-1.2 2.8M20.2 7.25l-3 .25 1.2-2.8" />
  </svg>
);

const FlameIcon = ({ color = '#ffffff' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.6c.6 3.2 2.3 4.6 3.9 6.3 1.7 1.8 2.6 3.5 2.6 5.6 0 3.9-3 7-6.5 7s-6.5-3.1-6.5-7c0-2.7 1.5-4.6 3-6.1-.1 1.9.7 3.1 2 3.6-.6-2.9.2-7 1.5-9.4Z"
      fill={color}
    />
  </svg>
);

const SuperFlameIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M14.5 4.2c.4 2.3 1.7 3.3 2.8 4.6 1.2 1.3 1.9 2.5 1.9 4 0 2.8-2.2 5-4.7 5s-4.7-2.2-4.7-5c0-1.9 1.1-3.3 2.2-4.4-.1 1.4.5 2.2 1.4 2.6-.4-2.1.2-5 1.1-6.8Z"
      fill="#ee5b35"
    />
    <g stroke="#ee5b35" strokeWidth="1.9" strokeLinecap="round">
      <path d="M3.4 9.8h3.4" />
      <path d="M2.6 13.4h4.4" />
      <path d="M4.2 17h3.2" />
    </g>
  </svg>
);

/* ── Boutons d'action flottants, cliquables, animés ── */

const ACTIONS = [
  { key: 'rewind', Icon: RewindIcon, className: 'act-rewind', anim: 'anim-spin', label: 'Photo précédente' },
  { key: 'freeze', Icon: FreezeIcon, className: 'act-freeze', anim: 'anim-shake', label: 'Geler' },
  { key: 'flame', Icon: FlameIcon, className: 'act-flame', anim: 'anim-pop', label: 'Photo suivante' },
  { key: 'super', Icon: SuperFlameIcon, className: 'act-super', anim: 'anim-fly', label: 'Super Flame' },
];

/* ── Photos utilisateurs affichées dans l'écran du téléphone ──
   Optimisées : WebP 600x900 dans public/images/profiles/ */
const PROFILE_PICS = Array.from(
  { length: 6 },
  (_, i) => `/images/profiles/profile-${String(i + 1).padStart(2, '0')}.webp`
);

const STACK_CARDS = PROFILE_PICS.map((src, i) => (
  <img
    key={src}
    src={src}
    alt={`Profil ${i + 1}`}
    className="card-image"
    loading={i === PROFILE_PICS.length - 1 ? 'eager' : 'lazy'}
    draggable={false}
  />
));

export const PhoneShowcase = () => {
  const [bursts, setBursts] = useState({ rewind: 0, freeze: 0, flame: 0, super: 0 });
  const stackApi = useRef(null);

  const fire = (key) => {
    setBursts((b) => ({ ...b, [key]: b[key] + 1 }));
    trackEvent('hero_action_click', { event_category: 'engagement', event_label: key });

    /* La flamme passe à la photo suivante, le retour revient en arrière */
    if (key === 'flame') stackApi.current?.next();
    if (key === 'rewind') stackApi.current?.prev();
    /* Le gel déclenche l'effet Freeze dans le héros (~6 s) */
    if (key === 'freeze') window.dispatchEvent(new CustomEvent('kiro-freeze'));
  };

  return (
    <div className="phone-showcase">
      <div className="phone-tilt">
        <img
          src="/images/phone-frame.svg"
          alt=""
          aria-hidden="true"
          className="phone-frame"
          width="950"
          height="1610"
          fetchPriority="high"
          draggable={false}
        />

        {/* Pile de photos façon profils, dans l'écran du téléphone */}
        <div className="phone-screen-stack">
          <Stack
            apiRef={stackApi}
            randomRotation={false}
            sensitivity={140}
            sendToBackOnClick={false}
            cards={STACK_CARDS}
            autoplay={false}
          />
        </div>
      </div>

      <div className="phone-actions">
        {ACTIONS.map(({ key, Icon, className, anim, label }) => (
          <m.button
            key={key}
            type="button"
            className={`action-btn ${className} ${bursts[key] > 0 ? 'has-burst' : ''}`}
            aria-label={label}
            onClick={() => fire(key)}
            whileTap={{ scale: 0.88 }}
          >
            <span className={`action-icon ${anim}`} key={`${key}-${bursts[key]}`}>
              <Icon />
            </span>
            <span className="action-ring" key={`ring-${key}-${bursts[key]}`} />
          </m.button>
        ))}
      </div>
    </div>
  );
};
