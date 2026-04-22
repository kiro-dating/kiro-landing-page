import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeDollarSign, Globe, TrendingUp } from 'lucide-react';
import './Partnerships.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const TikTokIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const InstagramIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export const Partnerships = () => {
  const { t } = useTranslation();
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const partnershipPoints = [
    {
      icon: BadgeDollarSign,
      title: t('partnerships.item1_title'),
      description: t('partnerships.item1_desc')
    },
    {
      icon: TrendingUp,
      title: t('partnerships.item2_title'),
      description: t('partnerships.item2_desc')
    },
    {
      icon: Globe,
      title: t('partnerships.item3_title'),
      description: t('partnerships.item3_desc')
    }
  ];

  const socials = [
    {
      id: 'tiktok',
      icon: <TikTokIcon />,
      message: t('partnerships.socials.tiktok')
    },
    {
      id: 'instagram',
      icon: <InstagramIcon size={24} />,
      message: t('partnerships.socials.instagram')
    },
    {
      id: 'facebook',
      icon: <FacebookIcon size={24} />,
      message: t('partnerships.socials.facebook')
    }
  ];

  return (
    <div className="partnerships-section">
      <motion.div 
        className="partnerships-content glass-panel"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 variants={itemVariants} className="partnerships-title">
          {t('partnerships.title')}
        </motion.h2>
        
        <motion.p 
          variants={itemVariants} 
          className="partnerships-text"
          dangerouslySetInnerHTML={{ __html: t('partnerships.text') }} 
        />
        
        <motion.ul className="partnerships-list" variants={containerVariants}>
          {partnershipPoints.map(({ icon: Icon, title, description }) => (
            <motion.li key={title} variants={itemVariants} className="partnerships-list-item">
              <div className="check-icon-wrap">
                <Icon size={22} className="check-icon" />
              </div>
              <div className="partnership-copy">
                <span className="partnership-point-title">{title}</span>
                <span className="partnership-point-desc">{description}</span>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div variants={itemVariants} className="socials-container">
          {socials.map((social) => (
            <div 
              key={social.id} 
              className="social-item-wrapper"
              onMouseEnter={() => setHoveredSocial(social.id)}
              onMouseLeave={() => setHoveredSocial(null)}
            >
              <AnimatePresence>
                {hoveredSocial === social.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="social-tooltip"
                  >
                    {social.message}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button 
                className="social-icon-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ 
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() } 
                }}
              >
                {social.icon}
              </motion.button>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
