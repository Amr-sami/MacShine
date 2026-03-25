import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // cubic easeOut
      setValue(Math.round(target * ease));
      
      if (t < 1) requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
  }, [target, duration]);
  
  return value;
}
