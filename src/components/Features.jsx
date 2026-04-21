import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Users, Sparkles, Heart } from 'lucide-react';
import './Features.css';

export const Features = () => {
  const { t } = useTranslation();

  const featureItems = [
    {
      icon: <Languages size={24} />,
      title: t('features.item1_title'),
      desc: t('features.item1_desc')
    },
    {
      icon: <Users size={24} />,
      title: t('features.item2_title'),
      desc: t('features.item2_desc')
    },
    {
      icon: <Sparkles size={24} />,
      title: t('features.item3_title'),
      desc: t('features.item3_desc')
    },
    {
      icon: <Heart size={24} />,
      title: t('features.item4_title'),
      desc: t('features.item4_desc')
    }
  ];

  return (
    <div className="features-section">
      <h2 className="section-title">{t('features.title')}</h2>
      <div className="features-grid">
        {featureItems.map((item, index) => (
          <div key={index} className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              {item.icon}
            </div>
            <h3 className="feature-title">{item.title}</h3>
            <p className="feature-desc text-secondary">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
