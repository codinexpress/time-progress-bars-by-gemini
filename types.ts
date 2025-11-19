
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

export interface BaseVisualizationProps {
  label: string;
  percentage: number;
  details: Omit<TimeDetails, 'percentage' | 'raw'>;
  icon: React.ReactNode;
  textColor?: string; 
  mainValueColor?: string;
  isMaximized?: boolean;
  sizeClassName?: string; // For controlling the width/height of circular visualizations
  decimalPlaces: number; // New prop for precision control
}

export interface ProgressBarProps extends BaseVisualizationProps {
  barColor?: string; 
  trailColor?: string; 
  showPercentageText?: boolean;
}

export interface TimeOrbitProps extends BaseVisualizationProps {
  orbitColor?: string; 
  planetColor?: string; 
}

export interface PixelGridProps extends BaseVisualizationProps {
  pixelColor?: string; 
  emptyPixelColor?: string; 
  gridRows?: number;
  gridCols?: number;
}

export interface TimeSpiralProps extends BaseVisualizationProps {
  spiralColor?: string; 
  trackColor?: string; 
}

export interface HourglassProps extends BaseVisualizationProps {
  sandColor?: string; 
  frameColor?: string; 
}

export interface RadialSliceProps extends BaseVisualizationProps {
  sliceColor?: string; 
  trackColor?: string; 
}

export type TimeUnitId = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'decade';

export interface ProgressItemConfig {
  id: TimeUnitId;
  label: string;
  getDetails: (date: Date, weekStartDay: WeekStartDay) => TimeDetails;
  icon: (props: IconProps) => React.ReactNode; 
  baseColor: string; 
  gridConfig?: { rows: number; cols: number };
}

export interface CurrentTimeDisplayProps {
  currentTime: Date;
}

export type CustomColors = {
  [key in TimeUnitId]?: string; // Stores hex color strings
};

export type DecimalOverrides = {
  [key in TimeUnitId]?: number; // Stores number of decimal places
};

export interface AppSettings {
  theme: Theme;
  weekStartDay: WeekStartDay;
  visualizationMode: VisualizationMode;
  updateIntervalMs: number;
  customColors: CustomColors;
  globalDecimalPlaces: number;
  decimalPlaceOverrides: DecimalOverrides;
}

export interface SettingsProps {
  settings: AppSettings;
  onSettingChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetAllSettings: () => void;
  onDecimalOverrideChange: (unitId: TimeUnitId, value: number | null) => void;
}

export interface ColorCustomizerProps {
  progressConfigs: ReadonlyArray<ProgressItemConfig>; 
  customColors: CustomColors;
  onColorChange: (unitId: TimeUnitId, colorHex: string) => void; 
  onResetColors: () => void;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string; // ISO string
}

export interface CommentData { 
  comments: Comment[];
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
