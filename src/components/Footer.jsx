import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Apple, Play, FileText, ShieldCheck, LifeBuoy, Mail } from 'lucide-react';
import { LINKS, SITE_URL } from '../config/links';
import './Footer.css';

const Ext = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

/* Icônes de marque (lucide ne fournit plus les logos de réseaux) */
const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.9 2.9 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/icons/kiro-symbol.svg" alt="Kiro" width="40" height="46" loading="lazy" />
          <p>{t('footer.tagline')}</p>
          <p className="footer-langs">{t('footer.langs')}</p>
        </div>

        <div className="footer-col">
          <h4>{t('footer.col_test')}</h4>
          <ul>
            <li><Ext href={LINKS.telegram}><Send size={16} /> {t('footer.test_telegram')}</Ext></li>
            <li><Ext href={LINKS.testflight}><Apple size={16} /> {t('footer.test_ios')}</Ext></li>
            <li><Ext href={LINKS.playstore}><Play size={16} /> {t('footer.test_android')}</Ext></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t('footer.col_legal')}</h4>
          <ul>
            <li><Ext href={LINKS.terms}><FileText size={16} /> {t('footer.terms')}</Ext></li>
            <li><Ext href={LINKS.privacy}><ShieldCheck size={16} /> {t('footer.privacy')}</Ext></li>
            <li><Ext href={LINKS.support}><LifeBuoy size={16} /> {t('footer.help')}</Ext></li>
            <li><a href={`mailto:${LINKS.contactEmail}`}><Mail size={16} /> {t('footer.contact')}</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t('footer.col_social')}</h4>
          <ul>
            <li><Ext href={LINKS.tiktok}><TikTokIcon /> TikTok</Ext></li>
            <li><Ext href={LINKS.instagram}><InstagramIcon /> Instagram</Ext></li>
            <li><Ext href={LINKS.facebook}><FacebookIcon /> Facebook</Ext></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {year} Kiro. {t('footer.rights')}</span>
          <span>{SITE_URL.replace('https://', '')}</span>
        </div>
      </div>
    </footer>
  );
};
