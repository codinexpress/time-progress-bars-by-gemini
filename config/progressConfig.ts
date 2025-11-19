
import { ProgressItemConfig } from '../types';
import {
  getSecondDetails, getMinuteDetails, getHourDetails,
  getDayDetails, getWeekDetails, getMonthDetails, getQuarterDetails, getYearDetails, getDecadeDetails,
} from '../utils/timeUtils';
import {
  SecondIcon, MinuteIcon, HourIcon, DayIcon, WeekIcon, MonthIcon, QuarterIcon, YearIcon, DecadeIcon
} from '../components/Icons';

export const DEFAULT_PROGRESS_CONFIGS: ReadonlyArray<ProgressItemConfig> = [
  { id: 'second', label: 'Second', getDetails: getSecondDetails, icon: (props) => SecondIcon(props), baseColor: '#14b8a6'}, // teal-500
  { id: 'minute', label: 'Minute', getDetails: getMinuteDetails, icon: (props) => MinuteIcon(props), baseColor: '#06b6d4'}, // cyan-500
  { id: 'hour', label: 'Hour', getDetails: getHourDetails, icon: (props) => HourIcon(props), baseColor: '#3b82f6'},   // blue-500
  { id: 'day', label: 'Day', getDetails: getDayDetails, icon: (props) => DayIcon(props), baseColor: '#0ea5e9' },     // sky-500
  { id: 'week', label: 'Week', getDetails: getWeekDetails, icon: (props) => WeekIcon(props), baseColor: '#10b981' },   // emerald-500
  { id: 'month', label: 'Month', getDetails: getMonthDetails, icon: (props) => MonthIcon(props), baseColor: '#f59e0b' }, // amber-500
  { id: 'quarter', label: 'Quarter', getDetails: getQuarterDetails, icon: (props) => QuarterIcon(props), baseColor: '#f97316' }, // orange-500
  { id: 'year', label: 'Year', getDetails: getYearDetails, icon: (props) => YearIcon(props), baseColor: '#f43f5e' },   // rose-500
  { id: 'decade', label: 'Decade', getDetails: getDecadeDetails, icon: (props) => DecadeIcon(props), baseColor: '#8b5cf6' }, // violet-500
];
