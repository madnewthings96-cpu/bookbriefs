import React, { useState, useEffect } from 'react';

const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / documentHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', calculateProgress);
    // Initial calculation
    calculateProgress();

    return () => window.removeEventListener('scroll', calculateProgress);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-1 z-50"
      style={{ backgroundColor: 'rgba(47, 79, 79, 0.1)' }} // Dark slate gray with opacity
    >
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: '#FF7F50', // Coral color
        }}
      />
    </div>
  );
};

export default ReadingProgressBar;