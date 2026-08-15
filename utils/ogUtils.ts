import { TimeUnitId, WeekStartDay } from '../types';
import {
  getSecondDetails, getMinuteDetails, getHourDetails, getHeartbeatDetails,
  getDayDetails, getDaylightDetails, getWeekDetails, getMoonPhaseDetails,
  getMonthDetails, getQuarterDetails, getYearDetails, getSeasonDetails,
  getDecadeDetails, getCenturyDetails, getLifeDetails,
} from './timeUtils';
import { DEFAULT_PROGRESS_CONFIGS } from '../config/progressConfig';

export interface OgData {
  id: TimeUnitId;
  label: string;
  section: string;
  baseColor: string;
  percentage: number;
  percentageFormatted: string;
  elapsed: string;
  remaining: string;
  period: string;
}

/**
 * Returns the client user's UTC offset in minutes (e.g. UTC-7 => -420, UTC+8 => +480, UTC+5:30 => +330).
 */
export function getUserTimezoneOffset(): number {
  if (typeof window === 'undefined') return 0;
  return -new Date().getTimezoneOffset();
}

/**
 * Formats a numeric offset in minutes to standard ISO offset format (e.g. "+08:00", "-07:00", "+05:30", "Z").
 */
export function formatUtcOffsetString(offsetMinutes: number): string {
  if (offsetMinutes === 0) return 'Z';
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formats a numeric offset in minutes into a friendly label (e.g. "UTC+8", "UTC-7", "UTC+5:30", "UTC").
 */
export function formatUtcOffsetLabel(offsetMinutes: number): string {
  if (offsetMinutes === 0) return 'UTC';
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Parses various timezone/offset representations (e.g. "+08:00", "-07:00", "480", "-420", "UTC+8", "Z") into offset minutes.
 */
export function parseUtcOffset(tzValue: string | number | null | undefined): number {
  if (tzValue === null || tzValue === undefined || tzValue === '') return 0;

  if (typeof tzValue === 'number') {
    // If between -14 and 14, treat as hours; otherwise treat as minutes
    if (Math.abs(tzValue) <= 14 && tzValue !== 0) {
      return Math.round(tzValue * 60);
    }
    return Math.round(tzValue);
  }

  const str = String(tzValue).trim();
  if (str === 'Z' || str === 'z' || str.toUpperCase() === 'UTC' || str.toUpperCase() === 'GMT') {
    return 0;
  }

  // Check for ISO offset format like "+08:00", "-07:00", "+0800", "-0700"
  const isoMatch = str.match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (isoMatch) {
    const sign = isoMatch[1] === '-' ? -1 : 1;
    const hours = parseInt(isoMatch[2], 10);
    const minutes = isoMatch[3] ? parseInt(isoMatch[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  }

  // Check for "UTC+8", "GMT-7", "UTC+5:30"
  const namedMatch = str.match(/^(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::(\d{2}))?$/i);
  if (namedMatch) {
    const sign = namedMatch[1] === '-' ? -1 : 1;
    const hours = parseInt(namedMatch[2], 10);
    const minutes = namedMatch[3] ? parseInt(namedMatch[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  }

  // Check for raw integer string (e.g. "480", "-420", "8", "-7")
  const num = parseFloat(str);
  if (!isNaN(num)) {
    if (Math.abs(num) <= 14 && num !== 0 && !str.includes('.')) {
      // Ambiguous: If string is "+8" or "-7", treat as hours. If "480", treat as minutes.
      if (str.startsWith('+') || str.startsWith('-') || Math.abs(num) <= 12) {
        return Math.round(num * 60);
      }
    }
    return Math.round(num);
  }

  return 0;
}

export function getUnitOgData(unitId: TimeUnitId, date: Date = new Date(), weekStartDay: WeekStartDay = 0, birthDate?: string): OgData | null {
  const config = DEFAULT_PROGRESS_CONFIGS.find(c => c.id === unitId);
  if (!config) return null;

  const details = config.getDetails(date, weekStartDay, birthDate);
  const sectionLabels: Record<string, string> = {
    micro: 'Micro Scale',
    cyclical: 'Cyclical Scale',
    macro: 'Macro Scale',
    mega: 'Mega Scale'
  };

  return {
    id: config.id,
    label: config.label,
    section: sectionLabels[config.section] || config.section.toUpperCase(),
    baseColor: config.baseColor,
    percentage: details.percentage,
    percentageFormatted: `${details.percentage.toFixed(2)}%`,
    elapsed: details.elapsed,
    remaining: details.remaining,
    period: details.period
  };
}

export function getAllUnitsOgData(date: Date = new Date(), weekStartDay: WeekStartDay = 0): OgData[] {
  return DEFAULT_PROGRESS_CONFIGS.map(config => {
    const details = config.getDetails(date, weekStartDay);
    const sectionLabels: Record<string, string> = {
      micro: 'Micro Scale',
      cyclical: 'Cyclical Scale',
      macro: 'Macro Scale',
      mega: 'Mega Scale'
    };

    return {
      id: config.id,
      label: config.label,
      section: sectionLabels[config.section] || config.section.toUpperCase(),
      baseColor: config.baseColor,
      percentage: details.percentage,
      percentageFormatted: `${details.percentage.toFixed(1)}%`,
      elapsed: details.elapsed,
      remaining: details.remaining,
      period: details.period
    };
  });
}

/**
 * Generates high-entropy cache busting tokens (timestamp + unique short hex nonce)
 */
export function generateCacheBuster() {
  const t = Date.now();
  const v = Math.random().toString(36).substring(2, 8);
  return { t, v };
}

/**
 * Builds the canonical or relative Open Graph image URL with timezone and cache-busting timestamp
 */
export function getOgImageUrl(params: {
  item?: string | null;
  tab?: string | null;
  mode?: string | null;
  theme?: 'light' | 'dark';
  tz?: string | number | null;
  t?: number | string | null;
  v?: string | null;
  origin?: string;
}): string {
  const query = new URLSearchParams();
  if (params.item) query.set('item', params.item);
  if (params.tab && params.tab !== 'visualizations') query.set('tab', params.tab);
  if (params.mode && params.mode !== 'bars') query.set('mode', params.mode);
  if (params.theme && params.theme !== 'dark') query.set('theme', params.theme);
  
  if (params.tz !== undefined && params.tz !== null && params.tz !== '') {
    query.set('tz', String(params.tz));
  }
  if (params.t !== undefined && params.t !== null && params.t !== '') {
    query.set('t', String(params.t));
  }
  if (params.v !== undefined && params.v !== null && params.v !== '') {
    query.set('v', String(params.v));
  }

  const queryString = query.toString();
  const basePath = `/api/og${queryString ? `?${queryString}` : ''}`;
  
  if (params.origin) {
    return `${params.origin.replace(/\/$/, '')}${basePath}`;
  }
  
  return basePath;
}

/**
 * Builds social share links for a specific card or current view
 */
export function getSocialShareLinks(params: {
  url: string;
  title: string;
  text: string;
}) {
  const encodedUrl = encodeURIComponent(params.url);
  const encodedTitle = encodeURIComponent(params.title);
  const encodedText = encodeURIComponent(params.text);

  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };
}

/**
 * Direct platform debugging/cache invalidation links
 */
export function getPlatformDebuggerLinks(url: string) {
  const encodedUrl = encodeURIComponent(url);
  return {
    facebook: `https://developers.facebook.com/tools/debug/?q=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodedUrl}`,
    twitter: `https://cards-dev.twitter.com/validator`,
    telegram: `https://t.me/WebpageBot`,
  };
}
