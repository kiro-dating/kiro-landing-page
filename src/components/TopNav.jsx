import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { LINKS } from '../config/links';
import './TopNav.css';

export const TopNav = ({ onOpenLang }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`top-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="top-nav-inner">
        <a className="nav-brand" href="#" aria-label="Kiro">
          <img src="/icons/kiro-symbol.svg" alt="Kiro" width="36" height="42" />
        </a>

        <nav className="nav-center" aria-label="Navigation principale" onClick={closeMenu}>
          <a href="#concept">{t('nav.discover')}</a>
          <a href="#jeux">{t('nav.games')}</a>
          <a href="#abonnements">{t('nav.plans')}</a>
          <a href={LINKS.support} target="_blank" rel="noopener noreferrer">{t('nav.support')}</a>
          <a href={`mailto:${LINKS.contactEmail}`}>{t('nav.contact')}</a>
        </nav>

        <div className="nav-right">
          <button className="lang-toggle" onClick={onOpenLang} aria-label={t('nav.language')}>
            <Globe size={17} />
            {i18n.language.split('-')[0].toUpperCase()}
          </button>
          <button
            className="nav-burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
