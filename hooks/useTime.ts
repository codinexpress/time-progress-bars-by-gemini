
import { useState, useEffect } from 'react';

export const useTime = (intervalMs: number) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);
    
    return () => clearInterval(timerId);
  }, [intervalMs]);

  return currentTime;
};
