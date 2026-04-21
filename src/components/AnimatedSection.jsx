import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1], // Custom realistic ease-out
        delay: delay 
      }}
    >
      {children}
    </motion.div>
  );
};
