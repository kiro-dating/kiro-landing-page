/* Section unifiée « Les lieux Kiro » : lieux + événements en une galerie.
   100 % statique : 32 lieux mythiques, photos libres de droit (Wikimedia
   Commons — crédits dans public/images/places/ATTRIBUTIONS.md).
   Aucune API, aucune clé, aucun appel réseau. */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import CircularGallery from './CircularGallery';
import './KiroPlaces.css';

/* Sélection éditoriale (30 lieux) — ordre pensé pour varier villes et ambiances.
   Fichiers dans public/images/kiro-places/ ; place-33 à 36 = photos de Handy. */
const P = (n, key, text) => ({
  image: `/images/kiro-places/place-${String(n).padStart(2, '0')}-${key}.webp`,
  text,
});

const CURATED = [
  P(20, 'louvre', 'Musée du Louvre — Paris'),
  P(22, 'mont-royal', 'Belvédère du Mont-Royal — Montréal'),
  P(34, 'disfrutar', 'Disfrutar — Barcelone'),
  P(29, 'times-square', 'Times Square — New York'),
  P(6, 'citadelle', 'Citadelle Laferrière — Haïti'),
  P(24, 'osheaga', 'Osheaga — Montréal'),
  P(13, 'florian', 'Caffè Florian — Venise'),
  P(9, 'disney-wdw', 'Walt Disney World — Orlando'),
  P(25, 'schwartzs', "Schwartz's Deli — Montréal"),
  P(26, 'shibuya', 'Shibuya Crossing — Tokyo'),
  P(12, 'flore', 'Café de Flore — Paris'),
  P(8, 'copacabana', 'Copacabana — Rio de Janeiro'),
  P(36, 'vieux-port', 'Vieux-Port de Montréal'),
  P(23, 'monte-carlo', 'Casino de Monte-Carlo — Monaco'),
  P(18, 'katz', "Katz's Delicatessen — New York"),
  P(16, 'igloofest', 'Igloofest — Montréal'),
  P(11, 'eiffel', 'Tour Eiffel — Paris'),
  P(27, 'south-beach', 'Ocean Drive — Miami'),
  P(28, 'st-viateur', 'St-Viateur Bagel — Montréal'),
  P(31, 'trevi', 'Fontaine de Trevi — Rome'),
  P(7, 'coachella', 'Coachella — Californie'),
  P(35, 'monaco-f1', 'Grand Prix de Monaco — Monte-Carlo'),
  P(5, 'central-park', 'Central Park — New York'),
  P(15, 'huchette', 'Caveau de la Huchette — Paris'),
  P(19, 'labadee', 'Labadee — Haïti'),
  P(33, 'oratoire', 'Oratoire Saint-Joseph — Montréal'),
  P(10, 'disneyland', 'Disneyland — Californie'),
  P(14, 'guell', 'Park Güell — Barcelone'),
  P(30, 'tomorrowland', 'Tomorrowland — Belgique'),
  P(32, 'vieux-montreal', 'Vieux-Montréal — Montréal'),
];

export const KiroPlaces = () => {
  const { t } = useTranslation();

  return (
    <section id="lieux" className="section s-places s-kiroplaces">
      <div className="section-inner">
        <div className="section-head-center">
          <p className="section-eyebrow">{t('kiroplaces.eyebrow')}</p>
          <h2 className="section-title">{t('kiroplaces.title')}</h2>
          <p className="section-desc">{t('kiroplaces.desc')}</p>
        </div>
      </div>

      {/* Galerie pleine largeur : drag, balayage, flèches clavier */}
      <div className="kiroplaces-gallery">
        <CircularGallery
          items={CURATED}
          bend={2.2}
          textColor="#171515"
          borderRadius={0.06}
          font="bold 26px Inter"
          scrollSpeed={2}
          scrollEase={0.06}
        />
      </div>

      <div className="section-inner">
        <p className="places-note">
          <ShieldCheck size={15} /> {t('kiroplaces.note')}
        </p>
      </div>
    </section>
  );
};
