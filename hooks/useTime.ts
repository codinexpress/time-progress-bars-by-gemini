
import { useState, useEffect } from 'react';
import { getAdjustedTime } from '../utils/ogUtils';

export const useTime = (intervalMs: number, timezone: string = 'auto') => {
  const [currentTime, setCurrentTime] = useState(() => getAdjustedTime(new Date(), timezone));

  useEffect(() => {
    // Immediate update on timezone change
    setCurrentTime(getAdjustedTime(new Date(), timezone));

    const timerId = setInterval(() => {
      setCurrentTime(getAdjustedTime(new Date(), timezone));
    }, intervalMs);
    
    return () => clearInterval(timerId);
  }, [intervalMs, timezone]);

  return currentTime;
};
