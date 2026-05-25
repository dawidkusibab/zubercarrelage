import React, { useEffect, useState } from 'react';

const Preloader: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    let removeTimer: ReturnType<typeof setTimeout>;
    const hideTimer = setTimeout(() => {
      setHidden(true);
      removeTimer = setTimeout(() => setRemoved(true), 500);
    }, 600);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (removed) return null;

  return (
    <div className={`loader-bg${hidden ? ' hidden' : ''}`} id="loader">
      <div className="loader-inner">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>
    </div>
  );
};

export default Preloader;
