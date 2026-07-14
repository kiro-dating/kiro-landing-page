import React, { useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Apple, Play } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from './Button';
import { LINKS } from '../config/links';
import { LANGUAGES } from '../config/languages';
import { setLanguage } from '../i18n';
import { trackEvent } from '../lib/analytics';
import './Modals.css';

const Modal = ({ onClose, closeLabel, children }) => {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <m.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <m.div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <button className="modal-close" onClick={onClose} aria-label={closeLabel}>
          <X size={18} />
        </button>
        {children}
      </m.div>
    </m.div>
  );
};

export const Modals = ({ active, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code) => {
    setLanguage(code);
    document.documentElement.lang = code;
    try {
      window.localStorage.setItem('kiro-lang', code);
    } catch {
      /* stockage indisponible : on ignore */
    }
    trackEvent('language_change', { event_category: 'engagement', event_label: code });
    onClose();
  };

  return (
    <AnimatePresence>
      {active === 'test' && (
        <Modal key="test" onClose={onClose} closeLabel={t('modals.close')}>
          <div className="modal-icon modal-icon-brand">
            <img src="/icons/kiro-symbol.svg" alt="" width="30" height="35" draggable={false} />
          </div>
          <h3 className="modal-title">{t('modals.test_title')}</h3>
          <p className="modal-body">{t('modals.test_body')}</p>
          <div className="modal-actions">
            <Button
              as="a"
              className="btn-telegram"
              href={LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('telegram_click', { event_category: 'conversion', event_label: 'Modal Test' })}
            >
              <img src="/icons/telegram.svg" alt="" className="btn-social-icon" draggable={false} />
              {t('modals.test_button')}
            </Button>
            <Button
              as="a"
              className="btn-whatsapp"
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { event_category: 'conversion', event_label: 'Modal Test' })}
            >
              <img src="/icons/whatsapp.svg" alt="" className="btn-social-icon" draggable={false} />
              {t('modals.test_whatsapp')}
            </Button>
          </div>
        </Modal>
      )}

      {active === 'beta' && (
        <Modal key="beta" onClose={onClose} closeLabel={t('modals.close')}>
          <div className="modal-icon modal-icon-brand">
            <img src="/icons/kiro-symbol.svg" alt="" width="30" height="35" draggable={false} />
          </div>
          <h3 className="modal-title">{t('modals.beta_title')}</h3>

          <div className="beta-guide">
            {/* ── iOS ── */}
            <section className="beta-block">
              <h4 className="beta-block-title">
                <Apple size={16} /> {t('modals.beta_ios_title')}
              </h4>
              <ol className="beta-steps">
                <li>
                  <img
                    src="/icons/testflight.svg"
                    alt="TestFlight"
                    className="testflight-icon"
                    draggable={false}
                  />
                  <span>
                    <Trans
                      i18nKey="modals.beta_ios_step1"
                      components={{
                        tf: (
                          <a
                            href={LINKS.testflightStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('testflight_store_click', { event_category: 'conversion', event_label: 'Modal Beta' })}
                          />
                        ),
                      }}
                    />
                  </span>
                </li>
                <li>
                  <span>
                    <Trans
                      i18nKey="modals.beta_ios_step2"
                      components={{
                        tg: (
                          <a
                            href={LINKS.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('telegram_click', { event_category: 'conversion', event_label: 'Modal Beta' })}
                          />
                        ),
                        wa: (
                          <a
                            href={LINKS.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('whatsapp_click', { event_category: 'conversion', event_label: 'Modal Beta' })}
                          />
                        ),
                      }}
                    />
                  </span>
                </li>
                <li>
                  <span>{t('modals.beta_ios_step3')}</span>
                </li>
              </ol>
            </section>

            {/* ── Android ── */}
            <section className="beta-block">
              <h4 className="beta-block-title">
                <Play size={16} /> {t('modals.beta_android_title')}
              </h4>
              <p className="beta-android">
                <Trans
                  i18nKey="modals.beta_android_desc"
                  components={{
                    tg: (
                      <a
                        href={LINKS.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('telegram_click', { event_category: 'conversion', event_label: 'Modal Beta' })}
                      />
                    ),
                    wa: (
                      <a
                        href={LINKS.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('whatsapp_click', { event_category: 'conversion', event_label: 'Modal Beta' })}
                      />
                    ),
                  }}
                />
              </p>
            </section>
          </div>
        </Modal>
      )}

      {active === 'lang' && (
        <Modal key="lang" onClose={onClose} closeLabel={t('modals.close')}>
          <div className="modal-icon modal-icon-brand">
            <img src="/icons/kiro-symbol.svg" alt="" width="30" height="35" draggable={false} />
          </div>
          <h3 className="modal-title">{t('modals.lang_title')}</h3>
          <p className="lang-current">
            {currentLang.region ? `${currentLang.label} (${currentLang.region})` : currentLang.label}
          </p>
          <div className="lang-divider" aria-hidden="true" />
          <div className="lang-grid">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`lang-item ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
              >
                <strong>{lang.label}</strong>
                <small>{lang.region || '\u00A0'}</small>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
