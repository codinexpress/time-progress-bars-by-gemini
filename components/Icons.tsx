
import React from 'react';
import { IconProps } from '../types';

export const SunIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.834a.75.75 0 00-1.06 1.06l-1.59-1.591a.75.75 0 00-1.061-1.06l1.59-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.106 6.106a.75.75 0 001.06-1.06l-1.591-1.59a.75.75 0 00-1.06 1.061l1.591 1.59z" />
  </svg>
);

export const MoonIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.382-8.442a.75.75 0 01.819.162z" clipRule="evenodd" />
  </svg>
);

export const SecondIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 1.5M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12L12 6" />
  </svg>
);

export const MinuteIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const HourIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

export const DayIcon = ({className, color, ...rest}: IconProps) => <SunIcon className={className} color={color} {...rest} />;

export const WeekIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

export const MonthIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 15H9.75v2.25H7.5V15H5.25v-2.25H7.5V10.5h2.25V12.75h2.25V15Z" />
  </svg>
);

export const QuarterIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
);

export const YearIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" transform="scale(0.8) translate(2.5 2.5)"/>
     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M12 2.25V9" />
  </svg>
);

export const DecadeIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12v-.008ZM12 12h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75v-.008ZM9.75 12h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5v-.008ZM7.5 12h.008v.008H7.5v-.008ZM14.25 15h.008v.008h-.008v-.008ZM14.25 12h.008v.008h-.008v-.008ZM16.5 15h.008v.008h-.008v-.008ZM16.5 12h.008v.008h-.008v-.008Z" />
  </svg>
);

export const BarsIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path d="M3 12h2V4H3v8zm4-6h2v14H7V6zm4-4h2v18h-2V2zm4 6h2v12h-2V8zm4-3h2v15h-2V5z"/>
  </svg>
);

export const OrbitIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.0006 18.0002C13.1338 19.867 10.3074 20.1335 8.13281 18.6854C5.9582 17.2373 4.93805 14.6043 5.89438 12.2502C6.85071 9.89609 9.31836 8.36805 11.8662 8.99713C14.414 9.6262 16.3159 11.8655 16.487 14.496C16.6581 17.1266 14.986 19.5441 12.5 20.0002" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
    <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor"/>
  </svg>
);

export const PixelIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 1h4v4h-4v-4zm6-1h4v4h-4v-4z"/>
  </svg>
);

export const SpiralIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.071 4.929C15.166 1.024 8.834 1.024 4.929 4.929s-3.905 8.237 0 12.142C7.834 20.076 12.166 21 15 21c2.834 0 6.166-.924 9.071-4.829-2.905-3.905-1.976-9.237 1-12.142zM12 12a3 3 0 100-6 3 3 0 000 6z" transform="rotate(45 12 12)"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2.333-2.333-2.333-6.167 0-8.5s6.167-2.333 8.5 0c2.333 2.333 2.333 6.167 0 8.5s-6.167 2.333-8.5 0z" />
  </svg>
);

export const HourglassIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 18.75L5.25 5.25m13.5 0L5.25 18.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14v2H5V3zm0 16h14v2H5v-2z" fill="currentColor"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5l4 4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 19l4-4 4 4" />
  </svg>
);

export const RadialSliceIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8v8h8c0 4.41-3.59 8-8 8z" />
  </svg>
);

export const ResetIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const EyeIcon = ({ className = "w-5 h-5", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const SparkleIcon = ({ className = "w-3 h-3", color, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} style={color ? { color } : {}} {...rest}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.118a.75.75 0 00.428 1.318l4.753.39 1.83 4.401c.321.772 1.415.772 1.736 0l1.83-4.401 4.753-.39 3.423-3.118a.75.75 0 00-.428-1.318l-4.753-.39-1.83-4.401zM16.25 10a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM5 12.5a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM10 16.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
  </svg>
);

export const HeartIcon = ({ className = "w-6 h-6", color, onClick, style, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color || "currentColor"} className={className} onClick={onClick} style={style} {...rest}>
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.004-.004.001a.752.752 0 01-.704 0l-.004-.001z" />
  </svg>
);

export const StarIcon = ({ className = "w-6 h-6", color, onClick, style, filled = true, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? (color || "currentColor") : "none"} stroke={color || "currentColor"} strokeWidth={1.5} className={className} onClick={onClick} style={style} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.82-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export const ExpandIcon = ({ className = "w-5 h-5", color, onClick, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} onClick={onClick} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

export const XMarkIcon = ({ className = "w-5 h-5", color, onClick, ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={color ? { color } : {}} onClick={onClick} {...rest}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
