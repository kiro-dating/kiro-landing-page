import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

export const Button = ({ children, onClick, className = '', type = 'button' }) => {
  return (
    <motion.button
      type={type}
      className={`premium-button ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      {children}
    </motion.button>
  );
};
