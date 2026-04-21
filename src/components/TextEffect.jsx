import React from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export function TextEffect({
  children,
  preset = 'fade-in-blur',
  speedReveal = 1,
  speedSegment = 0.3,
  className,
  as: Component = 'div',
  per = 'word',
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const controls = useAnimation();

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  if (typeof children !== 'string') {
    return <Component className={className}>{children}</Component>;
  }

  // Split logic based on words or characters
  const segments = per === 'word' ? children.split(/(\s+)/) : children.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speedSegment * 0.1,
        delayChildren: 0.2, // Small delay before starting
      },
    },
  };

  const getVariants = () => {
    if (preset === 'fade-in-blur') {
      return {
        hidden: {
          opacity: 0,
          filter: 'blur(10px)',
          y: 6,
        },
        visible: {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          transition: {
            duration: speedReveal,
            ease: [0.16, 1, 0.3, 1], // Smooth custom ease
          },
        },
      };
    }
    // Fallback simple fade
    return {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: speedReveal },
      },
    };
  };

  const itemVariants = getVariants();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}
    >
      {segments.map((segment, index) => {
        if (segment.trim() === '') {
          return <span key={index}>{segment}</span>;
        }

        return (
          <motion.span
            key={index}
            variants={itemVariants}
            style={{ display: 'inline-block', position: 'relative' }}
          >
            {segment}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
