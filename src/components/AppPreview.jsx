import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './AppPreview.css';

export const AppPreview = () => {
  const { t } = useTranslation();

  return (
    <div className="preview-container">
      <motion.div 
        className="mockup main-mockup glass-panel"
        animate={{ y: [0, -15, 0] }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div className="mockup-screen">
          <div className="mockup-header">
            <div className="avatar"></div>
            <div className="header-text">
              <div className="line line-1"></div>
              <div className="line line-2"></div>
            </div>
          </div>
          <div className="mockup-body">
            <div className="feed-card"></div>
            <div className="feed-card small"></div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="mockup side-mockup glass-panel"
        animate={{ y: [0, 15, 0] }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="mockup-screen blur-overlay">
           <div className="heart-icon"></div>
           <div className="match-text">{t('preview.match')}</div>
        </div>
      </motion.div>
    </div>
  );
};
