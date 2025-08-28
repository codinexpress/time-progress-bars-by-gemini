
import { TimeDetails, WeekStartDay } from '../types';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export const formatDuration = (ms: number, detailLevel: 'full' | 'hm' | 's' | 'ms_only' = 'full'): string => {
  if (ms < 0) ms = 0;

  if (detailLevel === 'ms_only') {
    return `${Math.floor(ms)}ms`;
  }

  const days = Math.floor(ms / MS_PER_DAY);
  const hoursRemainder = ms % MS_PER_DAY;
  const hours = Math.floor(hoursRemainder / MS_PER_HOUR);
  const minutesRemainder = hoursRemainder % MS_PER_HOUR;
  const minutes = Math.floor(minutesRemainder / MS_PER_MINUTE);
  const secondsRemainder = minutesRemainder % MS_PER_MINUTE;
  const seconds = Math.floor(secondsRemainder / MS_PER_SECOND);
  const finalMilliseconds = Math.floor(secondsRemainder % MS_PER_SECOND);

  if (detailLevel === 's') {
    const totalSeconds = Math.floor(ms / MS_PER_SECOND);
    return `${totalSeconds}s`;
  }

  let parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  
  if (hours > 0) parts.push(`${hours}h`);
  
  // Add minutes if they exist and detail level requires them
  if (minutes > 0 && (detailLevel === 'full' || detailLevel === 'hm')) {
    parts.push(`${minutes}m`);
  }

  if (detailLevel === 'full') {
    if (seconds > 0) {
      parts.push(`${seconds}s`);
    }
    // If no larger units were added (d,h,m,s) and duration is < 1s, show ms.
    if (parts.length === 0 && ms > 0 && ms < MS_PER_SECOND) {
      parts.push(`${finalMilliseconds}ms`);
    }
  }
  
  if (parts.length === 0) {
    // Handle cases where no parts were added (e.g., 0ms duration, or small duration for 'hm')
    if (detailLevel === 'hm') {
        // For 'hm', if duration is less than 1 minute (but could be >0ms), show 0m.
        // If it has days or hours, it would already be in parts.
        return '0m';
    }
    // For 'full' or other cases (e.g. 0ms duration), default to 0s.
    return '0s'; 
  }

  return parts.join(' ');
};


const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric' });
};

// const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
//   return date.toLocaleTimeString('en-US', options || { hour: '2-digit', minute: '2-digit' });
// };

export const getSecondDetails = (now: Date): TimeDetails => {
  const totalMsInASecond = MS_PER_SECOND;
  const elapsedMsInCurrentSecond = now.getMilliseconds();
  const remainingMsInCurrentSecond = totalMsInASecond - elapsedMsInCurrentSecond;
  const percentage = Math.max(0, Math.min(100, (elapsedMsInCurrentSecond / totalMsInASecond) * 100));

  return {
    percentage,
    elapsed: formatDuration(elapsedMsInCurrentSecond, 'ms_only'),
    remaining: formatDuration(remainingMsInCurrentSecond, 'ms_only'),
    period: `Second ${now.getSeconds()}`,
    raw: { totalMs: totalMsInASecond, elapsedMs: elapsedMsInCurrentSecond, remainingMs: remainingMsInCurrentSecond }
  };
};

export const getMinuteDetails = (now: Date): TimeDetails => {
  const totalMsInAMinute = MS_PER_MINUTE;
  const elapsedMsInCurrentMinute = now.getSeconds() * MS_PER_SECOND + now.getMilliseconds();
  const remainingMsInCurrentMinute = totalMsInAMinute - elapsedMsInCurrentMinute;
  const percentage = Math.max(0, Math.min(100, (elapsedMsInCurrentMinute / totalMsInAMinute) * 100));
  
  return {
    percentage,
    elapsed: formatDuration(elapsedMsInCurrentMinute, 's'),
    remaining: formatDuration(remainingMsInCurrentMinute, 's'),
    period: `Minute ${now.getMinutes()}`,
    raw: { totalMs: totalMsInAMinute, elapsedMs: elapsedMsInCurrentMinute, remainingMs: remainingMsInCurrentMinute }
  };
};

export const getHourDetails = (now: Date): TimeDetails => {
  const totalMsInAnHour = MS_PER_HOUR;
  const elapsedMsInCurrentHour = now.getMinutes() * MS_PER_MINUTE + now.getSeconds() * MS_PER_SECOND + now.getMilliseconds();
  const remainingMsInCurrentHour = totalMsInAnHour - elapsedMsInCurrentHour;
  const percentage = Math.max(0, Math.min(100, (elapsedMsInCurrentHour / totalMsInAnHour) * 100));
  
  return {
    percentage,
    elapsed: formatDuration(elapsedMsInCurrentHour), // Defaults to 'full'
    remaining: formatDuration(remainingMsInCurrentHour), // Defaults to 'full'
    period: `Hour ${now.getHours()}`,
    raw: { totalMs: totalMsInAnHour, elapsedMs: elapsedMsInCurrentHour, remainingMs: remainingMsInCurrentHour }
  };
};


export const getDayDetails = (now: Date): TimeDetails => {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  
  const totalMs = endOfDay.getTime() - startOfDay.getTime();
  const elapsedMs = now.getTime() - startOfDay.getTime();
  const remainingMs = totalMs - elapsedMs;
  
  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
  
  return {
    percentage,
    elapsed: formatDuration(elapsedMs),
    remaining: formatDuration(remainingMs),
    period: `Today: ${formatDate(startOfDay)}`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};

export const getWeekDetails = (now: Date, weekStartDay: WeekStartDay = 0): TimeDetails => {
  const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)
  let daysToSubtract = currentDay - weekStartDay;
  if (daysToSubtract < 0) {
    daysToSubtract += 7; 
  }

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const totalMs = endOfWeek.getTime() - startOfWeek.getTime();
  const elapsedMs = now.getTime() - startOfWeek.getTime();
  const remainingMs = totalMs - elapsedMs;
  
  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

  return {
    percentage,
    elapsed: formatDuration(elapsedMs),
    remaining: formatDuration(remainingMs),
    period: `${formatDate(startOfWeek)} - ${formatDate(new Date(endOfWeek.getTime() - 1))}`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};

export const getMonthDetails = (now: Date): TimeDetails => {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  const totalMs = endOfMonth.getTime() - startOfMonth.getTime();
  const elapsedMs = now.getTime() - startOfMonth.getTime();
  const remainingMs = totalMs - elapsedMs;

  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
  
  const daysInMonth = (endOfMonth.getTime() - startOfMonth.getTime()) / MS_PER_DAY;

  return {
    percentage,
    elapsed: formatDuration(elapsedMs),
    remaining: formatDuration(remainingMs),
    period: `${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${Math.round(daysInMonth)} days)`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};

export const getYearDetails = (now: Date): TimeDetails => {
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  
  const totalMs = endOfYear.getTime() - startOfYear.getTime();
  const elapsedMs = now.getTime() - startOfYear.getTime();
  const remainingMs = totalMs - elapsedMs;

  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
  
  const dayOfYear = Math.floor(elapsedMs / MS_PER_DAY) + 1;
  const totalDaysInYear = Math.round(totalMs / MS_PER_DAY);

  return {
    percentage,
    elapsed: formatDuration(elapsedMs, 'hm'),
    remaining: formatDuration(remainingMs, 'hm'),
    period: `Year ${now.getFullYear()} (Day ${dayOfYear} of ${totalDaysInYear})`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};

export const getDecadeDetails = (now: Date): TimeDetails => {
  const currentYear = now.getFullYear();
  const startYearOfDecade = Math.floor(currentYear / 10) * 10;
  
  const startOfDecade = new Date(startYearOfDecade, 0, 1);
  const endOfDecade = new Date(startYearOfDecade + 10, 0, 1);
  
  const totalMs = endOfDecade.getTime() - startOfDecade.getTime();
  const elapsedMs = now.getTime() - startOfDecade.getTime();
  const remainingMs = totalMs - elapsedMs;

  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

  return {
    percentage,
    elapsed: formatDuration(elapsedMs, 'hm'),
    remaining: formatDuration(remainingMs, 'hm'),
    period: `Decade: ${startYearOfDecade} - ${startYearOfDecade + 9}`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};
