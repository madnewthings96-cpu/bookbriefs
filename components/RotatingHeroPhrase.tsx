import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { getNextHeroPhraseIndex, HERO_PHRASES } from './heroPhraseRotation';

const letterVariants = {
  hidden: { opacity: 0, y: '0.3em', filter: 'blur(7px)' },
  visible: { opacity: 1, y: '0em', filter: 'blur(0px)' },
};

const RotatingHeroPhrase: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const phrase = HERO_PHRASES[phraseIndex];

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhraseIndex(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPhraseIndex((currentIndex) => getNextHeroPhraseIndex(currentIndex));
    }, 3600);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className="text-forest-700">{HERO_PHRASES[0]}</span>;
  }

  return (
    <span
      aria-hidden="true"
      className="relative block min-h-[2.12em] max-w-full text-forest-700 min-[480px]:min-h-[1.06em]"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={phrase}
          className="relative inline-block max-w-full"
          initial={{ opacity: 0, y: '0.16em', filter: 'blur(7px)' }}
          animate={{ opacity: 1, y: '0em', filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: '-0.16em', filter: 'blur(6px)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="inline"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  delayChildren: 0.04,
                  staggerChildren: 0.018,
                },
              },
            }}
          >
            {Array.from(phrase).map((character, index) => (
              <motion.span
                // Position is stable within a phrase, making it safe to pair with the character here.
                key={`${character}-${index}`}
                className="inline-block"
                variants={letterVariants}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                {character === ' ' ? '\u00A0' : character}
              </motion.span>
            ))}
          </motion.span>

          <motion.span
            className="absolute -bottom-[0.08em] left-0 h-[3px] w-full origin-left rounded-full bg-[linear-gradient(90deg,#C49552_0%,#E3BE7D_72%,rgba(227,190,125,0)_100%)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.88, 0.7] }}
            transition={{ duration: 0.82, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RotatingHeroPhrase;
