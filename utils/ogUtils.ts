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
 * Builds the canonical or relative Open Graph image URL
 */
export function getOgImageUrl(params: {
  item?: string | null;
  tab?: string | null;
  mode?: string | null;
  theme?: 'light' | 'dark';
  origin?: string;
}): string {
  const query = new URLSearchParams();
  if (params.item) query.set('item', params.item);
  if (params.tab && params.tab !== 'visualizations') query.set('tab', params.tab);
  if (params.mode && params.mode !== 'bars') query.set('mode', params.mode);
  if (params.theme && params.theme !== 'dark') query.set('theme', params.theme);

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
