import React, { useState, useEffect } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+<>?';

export function TextScramble({
  children,
  className,
  as: Component = 'span',
  speed = 0.03,
  trigger,
  onHoverStart,
  onScrambleComplete,
}) {
  const [displayText, setDisplayText] = useState(children);

  useEffect(() => {
    if (!trigger) {
      setDisplayText(children);
      return;
    }

    const text = String(children);
    const length = text.length;
    let frame = 0;
    let animationFrameId;

    const animate = () => {
      let output = '';
      let complete = 0;

      // Speed scale factor (0.01 takes roughly 300ms for 5 chars)
      const solvedCount = Math.floor(frame * speed * 25);

      for (let i = 0; i < length; i++) {
        if (i < solvedCount) {
          output += text[i];
          complete++;
        } else if (text[i] === ' ') {
          output += ' ';
          complete++; // Don't scramble spaces
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(output);

      if (complete >= length) {
        if (onScrambleComplete) onScrambleComplete();
      } else {
        frame++;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [trigger, children, speed]); // Exclude onScrambleComplete from dependencies

  return (
    <Component className={className} onMouseEnter={onHoverStart}>
      {displayText}
    </Component>
  );
}
