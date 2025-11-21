
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
    // Total seconds logic, but format nicely
    const totalSeconds = Math.floor(ms / MS_PER_SECOND);
    return `${totalSeconds}s`;
  }

  let parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  
  if (detailLevel === 'full' || detailLevel === 'hm') {
    if (minutes > 0) parts.push(`${minutes}m`);
  }

  if (detailLevel === 'full') {
    // Always show seconds if we are in full mode, unless it's purely days/hours and we want clean look.
    // But for progress bars, seeing the seconds tick is good.
    if (seconds > 0 || (parts.length > 0 && finalMilliseconds > 0)) { 
       parts.push(`${seconds}s`);
    }
    
    // Show ms only if it's very short duration or no other parts
    if (parts.length === 0 && ms > 0) {
      parts.push(`${finalMilliseconds}ms`);
    } else if (parts.length === 0) {
      return '0s';
    }
  }
  
  if (parts.length === 0) {
    if (detailLevel === 'hm') return '0m';
    return '0s'; 
  }

  return parts.join(' ');
};


const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric' });
};

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

export const getHeartbeatDetails = (now: Date): TimeDetails => {
  // Average resting heart rate ~80 bpm -> 1.33 bps -> ~750ms per beat.
  // Let's simulate a rhythmic cycle of 800ms.
  const BEAT_DURATION_MS = 800; 
  const ms = now.getTime();
  const elapsedMs = ms % BEAT_DURATION_MS;
  const remainingMs = BEAT_DURATION_MS - elapsedMs;
  const percentage = (elapsedMs / BEAT_DURATION_MS) * 100;

  return {
    percentage,
    elapsed: `${elapsedMs}ms`,
    remaining: `${remainingMs}ms`,
    period: 'Systole / Diastole',
    raw: { totalMs: BEAT_DURATION_MS, elapsedMs, remainingMs }
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
    elapsed: formatDuration(elapsedMsInCurrentHour), 
    remaining: formatDuration(remainingMsInCurrentHour),
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

export const getDaylightDetails = (now: Date): TimeDetails => {
  // Rough approximation for N. Hemisphere: Sunrise 6am-7am, Sunset 6pm-8pm varying by season.
  // Simplified solar cycle: ~6am to ~6pm average.
  // Winter: 7am - 5pm. Summer: 5:30am - 8:30pm.
  // Let's use a sine wave approximation based on day of year for sunrise/sunset.
  
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / MS_PER_DAY);
  
  // 172nd day is ~June 21st (Longest day). 
  // Approx hours of sunlight: 12 + 2.5 * sin(...)
  // This is a rough visual approximation, not astronomical.
  const lat = 40; // Assuming ~40deg N lat as a generic default
  const sunlightHours = 12 + 3 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 80));
  const solarNoon = 12; // 12:00 PM
  const sunriseHour = solarNoon - sunlightHours / 2;
  const sunsetHour = solarNoon + sunlightHours / 2;

  const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
  
  const totalMs = sunlightHours * MS_PER_HOUR;
  let elapsedMs = 0;
  
  if (currentHourDecimal < sunriseHour) {
      // Before sunrise
      elapsedMs = 0;
  } else if (currentHourDecimal > sunsetHour) {
      // After sunset
      elapsedMs = totalMs;
  } else {
      // During day
      elapsedMs = (currentHourDecimal - sunriseHour) * MS_PER_HOUR;
  }

  const remainingMs = totalMs - elapsedMs;
  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

  const sunriseTime = new Date(now);
  sunriseTime.setHours(Math.floor(sunriseHour), (sunriseHour % 1) * 60);
  const sunsetTime = new Date(now);
  sunsetTime.setHours(Math.floor(sunsetHour), (sunsetHour % 1) * 60);

  const period = currentHourDecimal > sunsetHour || currentHourDecimal < sunriseHour 
      ? "Night Time (Waiting for Sunrise)" 
      : `Daylight (${sunriseTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${sunsetTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})`;

  return {
      percentage,
      elapsed: formatDuration(elapsedMs, 'hm'),
      remaining: formatDuration(remainingMs, 'hm'),
      period,
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
  startOfWeek.setMilliseconds(0);

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

export const getMoonPhaseDetails = (now: Date): TimeDetails => {
  const synodicMonth = 29.53058867 * MS_PER_DAY; // Length of lunar cycle
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const msSinceNewMoon = now.getTime() - knownNewMoon;
  const elapsedMs = msSinceNewMoon % synodicMonth;
  const remainingMs = synodicMonth - elapsedMs;
  const percentage = (elapsedMs / synodicMonth) * 100;
  
  let phaseName = "New Moon";
  if (percentage > 2 && percentage < 23) phaseName = "Waxing Crescent";
  else if (percentage >= 23 && percentage < 27) phaseName = "First Quarter";
  else if (percentage >= 27 && percentage < 48) phaseName = "Waxing Gibbous";
  else if (percentage >= 48 && percentage < 52) phaseName = "Full Moon";
  else if (percentage >= 52 && percentage < 73) phaseName = "Waning Gibbous";
  else if (percentage >= 73 && percentage < 77) phaseName = "Last Quarter";
  else if (percentage >= 77 && percentage < 98) phaseName = "Waning Crescent";

  return {
    percentage,
    elapsed: `${(elapsedMs / MS_PER_DAY).toFixed(1)} days`,
    remaining: `${(remainingMs / MS_PER_DAY).toFixed(1)} days`,
    period: `Phase: ${phaseName}`,
    raw: { totalMs: synodicMonth, elapsedMs, remainingMs }
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

export const getQuarterDetails = (now: Date): TimeDetails => {
  const currentMonth = now.getMonth(); // 0-11
  const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4
  const startMonthOfQuarter = (currentQuarter - 1) * 3;

  const startOfQuarter = new Date(now.getFullYear(), startMonthOfQuarter, 1);
  const endOfQuarter = new Date(now.getFullYear(), startMonthOfQuarter + 3, 1);

  const totalMs = endOfQuarter.getTime() - startOfQuarter.getTime();
  const elapsedMs = now.getTime() - startOfQuarter.getTime();
  const remainingMs = totalMs - elapsedMs;

  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

  return {
    percentage,
    elapsed: formatDuration(elapsedMs, 'hm'),
    remaining: formatDuration(remainingMs, 'hm'),
    period: `Q${currentQuarter} ${now.getFullYear()}`,
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

export const getSeasonDetails = (now: Date): TimeDetails => {
  // Meteorological Seasons (N. Hemisphere)
  // Spring: Mar 1 - May 31
  // Summer: Jun 1 - Aug 31
  // Autumn: Sep 1 - Nov 30
  // Winter: Dec 1 - Feb 28/29
  
  const year = now.getFullYear();
  let start, end, seasonName;

  // Determine current season
  const month = now.getMonth(); // 0-11
  
  if (month >= 2 && month <= 4) {
    seasonName = "Spring";
    start = new Date(year, 2, 1);
    end = new Date(year, 5, 1);
  } else if (month >= 5 && month <= 7) {
    seasonName = "Summer";
    start = new Date(year, 5, 1);
    end = new Date(year, 8, 1);
  } else if (month >= 8 && month <= 10) {
    seasonName = "Autumn";
    start = new Date(year, 8, 1);
    end = new Date(year, 11, 1);
  } else {
    seasonName = "Winter";
    if (month === 11) { // Dec
      start = new Date(year, 11, 1);
      end = new Date(year + 1, 2, 1);
    } else { // Jan, Feb
      start = new Date(year - 1, 11, 1);
      end = new Date(year, 2, 1);
    }
  }

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const remainingMs = totalMs - elapsedMs;
  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

  return {
    percentage,
    elapsed: formatDuration(elapsedMs, 'hm'),
    remaining: formatDuration(remainingMs, 'hm'),
    period: `${seasonName} (Meteorological)`,
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
    period: `Decade: ${startYearOfDecade}s`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};

export const getCenturyDetails = (now: Date): TimeDetails => {
  const currentYear = now.getFullYear();
  const startYear = Math.floor(currentYear / 100) * 100;
  
  const startOfCentury = new Date(startYear, 0, 1);
  const endOfCentury = new Date(startYear + 100, 0, 1);
  
  const totalMs = endOfCentury.getTime() - startOfCentury.getTime();
  const elapsedMs = now.getTime() - startOfCentury.getTime();
  const remainingMs = totalMs - elapsedMs;
  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
  
  const centuryNum = Math.floor(currentYear / 100) + 1;

  return {
    percentage,
    elapsed: `${Math.floor(elapsedMs / (MS_PER_DAY * 365))} years`,
    remaining: `${Math.floor(remainingMs / (MS_PER_DAY * 365))} years`,
    period: `${centuryNum}${centuryNum === 21 ? 'st' : 'th'} Century`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};

export const getLifeDetails = (now: Date, _ws: WeekStartDay, birthDateStr?: string): TimeDetails => {
  const birth = birthDateStr ? new Date(birthDateStr) : new Date('1990-01-01');
  const avgLifespanYears = 72;
  const endOfLife = new Date(birth);
  endOfLife.setFullYear(birth.getFullYear() + avgLifespanYears);
  
  const totalMs = endOfLife.getTime() - birth.getTime();
  const elapsedMs = now.getTime() - birth.getTime();
  const remainingMs = totalMs - elapsedMs;
  const percentage = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

  return {
    percentage,
    elapsed: `${(elapsedMs / (MS_PER_DAY * 365.25)).toFixed(1)} years`,
    remaining: `${(remainingMs / (MS_PER_DAY * 365.25)).toFixed(1)} years`,
    period: `Life Expectancy (~${avgLifespanYears}y)`,
    raw: { totalMs, elapsedMs, remainingMs }
  };
};
