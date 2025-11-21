
import { ProgressItemConfig } from '../types';
import {
  getSecondDetails, getMinuteDetails, getHourDetails, getHeartbeatDetails,
  getDayDetails, getDaylightDetails, getWeekDetails, getMoonPhaseDetails,
  getMonthDetails, getQuarterDetails, getYearDetails, getSeasonDetails,
  getDecadeDetails, getCenturyDetails, getLifeDetails,
} from '../utils/timeUtils';
import {
  SecondIcon, MinuteIcon, HourIcon, HeartPulseIcon,
  DayIcon, SunIcon, WeekIcon, MoonIcon,
  MonthIcon, QuarterIcon, YearIcon, SeasonIcon,
  DecadeIcon, CenturyIcon, LifeIcon
} from '../components/Icons';

export const DEFAULT_PROGRESS_CONFIGS: ReadonlyArray<ProgressItemConfig> = [
  // Micro Time: Second, Minute, Hour, Heartbeats
  { 
    id: 'second', 
    label: 'Second', 
    section: 'micro', 
    getDetails: getSecondDetails, 
    icon: (props) => SecondIcon(props), 
    baseColor: '#14b8a6',
    gridConfig: { rows: 10, cols: 10 } // 100cs (Percentage view)
  },
  { 
    id: 'minute', 
    label: 'Minute', 
    section: 'micro', 
    getDetails: getMinuteDetails, 
    icon: (props) => MinuteIcon(props), 
    baseColor: '#06b6d4',
    gridConfig: { rows: 6, cols: 10 } // 60 Seconds
  },
  { 
    id: 'hour', 
    label: 'Hour', 
    section: 'micro', 
    getDetails: getHourDetails, 
    icon: (props) => HourIcon(props), 
    baseColor: '#3b82f6',
    gridConfig: { rows: 6, cols: 10 } // 60 Minutes
  },
  { 
    id: 'heartbeat', 
    label: 'Heartbeat', 
    section: 'micro', 
    getDetails: getHeartbeatDetails, 
    icon: (props) => HeartPulseIcon(props), 
    baseColor: '#ef4444',
    gridConfig: { rows: 10, cols: 10 } // 100%
  },

  // Cyclical Time: Day, Daylight, Week, Moon Phase
  { 
    id: 'day', 
    label: 'Day', 
    section: 'cyclical', 
    getDetails: getDayDetails, 
    icon: (props) => DayIcon(props), 
    baseColor: '#0ea5e9',
    gridConfig: { rows: 4, cols: 6 } // 24 Hours
  },
  { 
    id: 'daylight', 
    label: 'Daylight', 
    section: 'cyclical', 
    getDetails: getDaylightDetails, 
    icon: (props) => SunIcon(props), 
    baseColor: '#f59e0b',
    gridConfig: { rows: 10, cols: 10 } // 100%
  },
  { 
    id: 'week', 
    label: 'Week', 
    section: 'cyclical', 
    getDetails: getWeekDetails, 
    icon: (props) => WeekIcon(props), 
    baseColor: '#10b981',
    gridConfig: { rows: 1, cols: 7 } // 7 Days
  },
  { 
    id: 'moon', 
    label: 'Moon Phase', 
    section: 'cyclical', 
    getDetails: getMoonPhaseDetails, 
    icon: (props) => MoonIcon(props), 
    baseColor: '#94a3b8',
    gridConfig: { rows: 5, cols: 6 } // 30 Days (Approx cycle)
  },

  // Macro Time: Month, Quarter, Year, Season
  { 
    id: 'month', 
    label: 'Month', 
    section: 'macro', 
    getDetails: getMonthDetails, 
    icon: (props) => MonthIcon(props), 
    baseColor: '#8b5cf6',
    gridConfig: { rows: 5, cols: 7 } // 35 Slots (Covers max 31 days)
  },
  { 
    id: 'quarter', 
    label: 'Quarter', 
    section: 'macro', 
    getDetails: getQuarterDetails, 
    icon: (props) => QuarterIcon(props), 
    baseColor: '#f97316',
    gridConfig: { rows: 7, cols: 13 } // 91 Days (Approx 3 months)
  },
  { 
    id: 'year', 
    label: 'Year', 
    section: 'macro', 
    getDetails: getYearDetails, 
    icon: (props) => YearIcon(props), 
    baseColor: '#f43f5e',
    gridConfig: { rows: 14, cols: 26 } // 364 Days (52 weeks * 7) - close approximation to 365
  },
  { 
    id: 'season', 
    label: 'Season', 
    section: 'macro', 
    getDetails: getSeasonDetails, 
    icon: (props) => SeasonIcon(props), 
    baseColor: '#84cc16',
    gridConfig: { rows: 7, cols: 13 } // 91 Days (Approx 3 months)
  },

  // Mega Time: Decade, Century, Life Progress
  { 
    id: 'decade', 
    label: 'Decade', 
    section: 'mega', 
    getDetails: getDecadeDetails, 
    icon: (props) => DecadeIcon(props), 
    baseColor: '#6366f1',
    gridConfig: { rows: 2, cols: 5 } // 10 Years
  },
  { 
    id: 'century', 
    label: 'Century', 
    section: 'mega', 
    getDetails: getCenturyDetails, 
    icon: (props) => CenturyIcon(props), 
    baseColor: '#64748b',
    gridConfig: { rows: 10, cols: 10 } // 100 Years
  },
  { 
    id: 'life', 
    label: 'Life Progress', 
    section: 'mega', 
    getDetails: getLifeDetails, 
    icon: (props) => LifeIcon(props), 
    baseColor: '#db2777',
    gridConfig: { rows: 10, cols: 10 } // 100 Years (Standard cap)
  },
];
