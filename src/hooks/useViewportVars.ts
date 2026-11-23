'use client';

import { useEffect } from 'react';

export function useViewportVars() {
  useEffect(() => {
    const setVars = () => {
      // Use visualViewport if available (modern mobile browsers), otherwise fallback to innerHeight
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      const width = vv ? vv.width : window.innerWidth;

      document.documentElement.style.setProperty('--app-height', `${height}px`);
      document.documentElement.style.setProperty('--app-width', `${width}px`);
      
      // On mobile keyboard open, prevent body from being pushed up
      // by saving/restoring scroll position instead of hard-resetting to top
      if (vv && vv.height < window.innerHeight * 0.8) {
        const scrollY = window.scrollY;
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - scrollY) > 50) {
            window.scrollTo(0, scrollY);
          }
        });
      }
    };

    setVars();

    // Listen to resize on both window and visualViewport
    window.addEventListener('resize', setVars);
    window.addEventListener('focusin', setVars);
    window.addEventListener('focusout', setVars);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVars);
      window.visualViewport.addEventListener('scroll', setVars);
    }

    return () => {
      window.removeEventListener('resize', setVars);
      window.removeEventListener('focusin', setVars);
      window.removeEventListener('focusout', setVars);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVars);
        window.visualViewport.removeEventListener('scroll', setVars);
      }
    };
  }, []);
}
