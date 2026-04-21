import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { TextEffect } from './TextEffect';
import { TextScramble } from './TextScramble';
import './Hero.css';

export const Hero = () => {
  const { t } = useTranslation();
  const [isScrambleTriggered, setIsScrambleTriggered] = useState(false);

  return (
    <div className="hero-section">
      {/* Subtle radial glow behind the title */}
      <div className="hero-radial-glow"></div>
      
      <div className="hero-content">
        <motion.h1 
          className="hero-brand-name title-gradient mb-2"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setIsScrambleTriggered(true)}
        >
          <TextScramble 
            trigger={isScrambleTriggered} 
            speed={0.015} /* adjusted speed for length of "Kiro" to feel right */
            onScrambleComplete={() => setIsScrambleTriggered(false)}
          >
            {t('hero.brand')}
          </TextScramble>
        </motion.h1>
        
        <div className="hero-tagline-wrapper mt-4">
          <h2 className="hero-tagline m-0">
            <TextEffect preset="fade-in-blur" speedReveal={1.1} speedSegment={0.3}>
              {t('hero.tagline')}
            </TextEffect>
          </h2>
          <motion.p 
            className="hero-secondary text-secondary m-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }} /* delayed to show after text effect */
          >
            {t('hero.secondary')}
          </motion.p>
        </div>
        
        <motion.div 
          className="hero-cta-wrapper" 
          style={{ marginTop: '40px' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <Button className="hero-btn" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            {t('hero.cta')} <ArrowRight size={18} />
          </Button>
        </motion.div>

      </div>
    </div>
  );
};
