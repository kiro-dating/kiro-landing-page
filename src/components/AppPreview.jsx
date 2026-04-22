import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './AppPreview.css';

export const AppPreview = () => {
  const { t } = useTranslation();

  return (
    <div className="preview-container">
      {/* Ambient glow */}
      <div className="phone-glow" />

      {/* Ghost mockup — background context layer */}
      <motion.div
        className="mockup ghost-mockup glass-panel"
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <div className="mockup-screen blur-overlay">
          <div className="heart-icon" />
          <div className="match-text">{t('preview.match')}</div>
        </div>
      </motion.div>

      {/* Real screenshot — main foreground */}
      <motion.div
        className="phone-wrapper"
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img
          src="/profile_phone.png"
          alt="Kiro app — profile screen"
          className="phone-screenshot"
          draggable={false}
        />
      </motion.div>
    </div>
  );
};
