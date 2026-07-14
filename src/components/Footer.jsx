import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Apple, Play, FileText, ShieldCheck, LifeBuoy, Mail } from 'lucide-react';
import { LINKS } from '../config/links';
import './Footer.css';

const Ext = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
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
            <li><Ext href={LINKS.tiktok}>TikTok</Ext></li>
            <li><Ext href={LINKS.instagram}>Instagram</Ext></li>
            <li><Ext href={LINKS.facebook}>Facebook</Ext></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {year} Kiro. {t('footer.rights')}</span>
          <span>kirosocial.com</span>
        </div>
      </div>
    </footer>
  );
};
