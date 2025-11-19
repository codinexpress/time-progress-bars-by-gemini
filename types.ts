import React from 'react';

export type Theme = 'light' | 'dark';
export type WeekStartDay = 0 | 1; // 0 for Sunday, 1 for Monday
export type VisualizationMode = 'bars' | 'orbits' | 'pixels' | 'spiral' | 'hourglass' | 'radialSlice';

export interface TimeDetails {
  percentage: number;
  elapsed: string;
  remaining: string;
  period: string;
  raw?: {
    totalMs: number;
    elapsedMs: number;
    remainingMs: number;
  }
}

export interface IconProps {
  className?: string;
  color?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  filled?: boolean; // Optional, for icons like StarIcon
}

export interface ProgressBarProps {
  label: string;
  percentage: number;
  details?: Omit<TimeDetails, 'percentage' | 'raw'>;
  icon?: React.ReactNode;
  barColor?: string; // Expects a hex color string for custom colors, or a Tailwind class for defaults
  trailColor?: string; // Expects a Tailwind class
  textColor?: string; // For label and percentage text at top; expects a Tailwind class or hex color string
  showPercentageText?: boolean;
}

export interface TimeOrbitProps {
  label: string;
  percentage: number;
  details: Omit<TimeDetails, 'percentage' | 'raw'>;
  icon: React.ReactNode;
  orbitColor?: string; // Expects a hex color string for the planet's orbit path, or a Tailwind class
  planetColor?: string; // Expects a hex color string for custom colors, or a Tailwind class for defaults
  textColor?: string; // General text color for the card (label, details); expects a Tailwind class or hex color string
  mainValueColor?: string; // Specific color for the percentage text; expects a hex color string
}

export interface PixelGridProps {
  label: string;
  percentage: number;
  details: Omit<TimeDetails, 'percentage' | 'raw'>;
  icon: React.ReactNode;
  pixelColor?: string; // Expects a hex color string for custom colors, or a Tailwind class for defaults
  emptyPixelColor?: string; // Expects a hex color string (likely with alpha) or Tailwind class
  textColor?: string; // General text color; expects a Tailwind class or hex color string
  mainValueColor?: string; // Specific color for the percentage text; expects a hex color string
  gridRows?: number;
  gridCols?: number;
}

export interface TimeSpiralProps {
  label: string;
  percentage: number;
  details: Omit<TimeDetails, 'percentage' | 'raw'>;
  icon: React.ReactNode;
  spiralColor?: string; // Expects a hex color string for custom colors, or a Tailwind class for defaults
  trackColor?: string; // Color for the background spiral track
  textColor?: string; // General text color; expects a Tailwind class or hex color string
  mainValueColor?: string; // Specific color for the percentage text; expects a hex color string
}

export interface HourglassProps {
  label: string;
  percentage: number;
  details: Omit<TimeDetails, 'percentage' | 'raw'>;
  icon: React.ReactNode;
  sandColor?: string; // Expects a hex color string for custom colors, or a Tailwind class for defaults
  frameColor?: string; // Expects a Tailwind class for the frame
  textColor?: string; // General text color; expects a Tailwind class or hex color string
  mainValueColor?: string; // Specific color for the percentage text; expects a hex color string
}

export interface RadialSliceProps {
  label: string;
  percentage: number;
  details: Omit<TimeDetails, 'percentage' | 'raw'>;
  icon: React.ReactNode;
  sliceColor?: string; // Expects a hex color string for custom colors, or a Tailwind class for defaults
  trackColor?: string; // Expects a Tailwind class or hex string for the background track
  textColor?: string; // General text color; expects a Tailwind class or hex color string
  mainValueColor?: string; // Specific color for the percentage text; expects a hex color string
}

export type TimeUnitId = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'decade';

export interface ProgressItemConfig {
  id: TimeUnitId;
  label: string;
  getDetails: (date: Date, weekStartDay: WeekStartDay) => TimeDetails;
  icon: (props: IconProps) => React.ReactNode; // Updated to use global IconProps
  baseColor: string; // Now expects a hex color string by default
  gridConfig?: { rows: number; cols: number };
}

export interface CurrentTimeDisplayProps {
  currentTime: Date;
}

export type CustomColors = {
  [key in TimeUnitId]?: string; // Stores hex color strings
};

export interface AppSettings {
  theme: Theme;
  weekStartDay: WeekStartDay;
  visualizationMode: VisualizationMode;
  updateIntervalMs: number;
  customColors: CustomColors;
}

export interface SettingsProps {
  settings: AppSettings;
  onSettingChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetAllSettings: () => void;
}

export interface ColorCustomizerProps {
  progressConfigs: ReadonlyArray<ProgressItemConfig>; 
  customColors: CustomColors;
  onColorChange: (unitId: TimeUnitId, colorHex: string) => void; // colorHex is a hex string
  onResetColors: () => void;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string; // ISO string
}

export interface CommentData { // The structure stored in the bin
  comments: Comment[];
}

export interface CommentSectionProps {
  apiKey: string; 
  appTheme: Theme; 
}

// New types for Feedback System
export type ActiveTab = 'visualizations' | 'settings' | 'colors' | 'comments' | 'feedback';

export interface RatingCounts {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface FeedbackData {
  likeCount: number;
  hasLiked: boolean;
  ratingCounts: RatingCounts;
  userRating: number; // 0 if not rated, 1-5 if rated
}

export interface FeedbackSectionProps {
  feedbackData: FeedbackData;
  onLikeToggle: () => void;
  onRate: (rating: number) => void;
  isLoading: boolean;
  error: string | null;
  appTheme: Theme;
}

// API Key for keyvalue.immanuel.co
export const FEEDBACK_API_APP_KEY = 'fs04vuf5';
export const VISITOR_COUNT_KEY = 'temporalFluxVisitorCount';
export const LIKE_COUNT_KEY = 'temporalFluxLikeCount';
export const RATING_KEY_PREFIX = 'temporalFluxRating'; // e.g., temporalFluxRating1

export const LOCAL_STORAGE_HAS_LIKED_KEY = 'temporalFlux_hasLiked';
export const LOCAL_STORAGE_USER_RATING_KEY = 'temporalFlux_userRating';