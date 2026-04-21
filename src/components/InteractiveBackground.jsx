import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './InteractiveBackground.css';

export const InteractiveBackground = () => {
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Easing physics: very subtle and soft
  const springConfig = { stiffness: 40, damping: 30, mass: 2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Inverse movement for secondary elements to create a parallax/depth effect
  const inverseX = useTransform(smoothX, (v) => -v * 0.6);
  const inverseY = useTransform(smoothY, (v) => -v * 0.6);

  useEffect(() => {
    // Disable effect on mobile devices using simple window width check
    if (window.innerWidth <= 768) {
      setIsMobile(true);
      return;
    }

    const handleMouseMove = (e) => {
      // Normalize values between -1 and 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      // Move by a max of 40px in any direction (subtle background shift)
      mouseX.set(x * 40); 
      mouseY.set(y * 40);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (isMobile) {
    return (
      <div className="interactive-bg-wrapper">
        <div className="ambient-glow primary-glow" />
        <div className="ambient-glow secondary-glow" />
      </div>
    );
  }

  return (
    <div className="interactive-bg-wrapper">
      <motion.div 
        className="ambient-glow primary-glow"
        style={{
          x: smoothX,
          y: smoothY
        }}
      />
      <motion.div 
        className="ambient-glow secondary-glow"
        style={{
          x: inverseX,
          y: inverseY
        }}
      />
    </div>
  );
};
