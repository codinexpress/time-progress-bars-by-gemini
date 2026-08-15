import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Helper to format ms into clean human-readable duration
function formatMsDuration(ms: number, isShort = false): string {
  if (ms < 0) ms = 0;
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const days = Math.floor(ms / MS_PER_DAY);
  const hoursRemainder = ms % MS_PER_DAY;
  const hours = Math.floor(hoursRemainder / MS_PER_HOUR);
  const minutesRemainder = hoursRemainder % MS_PER_HOUR;
  const minutes = Math.floor(minutesRemainder / MS_PER_MINUTE);
  const secondsRemainder = minutesRemainder % MS_PER_MINUTE;
  const seconds = Math.floor(secondsRemainder / MS_PER_SECOND);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && (!isShort || days === 0)) parts.push(`${minutes}m`);
  if (parts.length === 0 || (!isShort && days === 0 && hours === 0)) {
    if (seconds > 0) parts.push(`${seconds}s`);
  }
  return parts.length > 0 ? parts.join(' ') : '0s';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const WEEKDAY_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
];

function parseUtcOffset(tzValue: string | null): number {
  if (!tzValue) return 0;
  const str = tzValue.trim();
  if (str === 'Z' || str === 'z' || str.toUpperCase() === 'UTC' || str.toUpperCase() === 'GMT') {
    return 0;
  }
  const isoMatch = str.match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (isoMatch) {
    const sign = isoMatch[1] === '-' ? -1 : 1;
    const hours = parseInt(isoMatch[2], 10);
    const minutes = isoMatch[3] ? parseInt(isoMatch[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  }
  const namedMatch = str.match(/^(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::(\d{2}))?$/i);
  if (namedMatch) {
    const sign = namedMatch[1] === '-' ? -1 : 1;
    const hours = parseInt(namedMatch[2], 10);
    const minutes = namedMatch[3] ? parseInt(namedMatch[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  }
  const num = parseFloat(str);
  if (!isNaN(num)) {
    if (Math.abs(num) <= 14 && num !== 0 && !str.includes('.')) {
      if (str.startsWith('+') || str.startsWith('-') || Math.abs(num) <= 12) {
        return Math.round(num * 60);
      }
    }
    return Math.round(num);
  }
  return 0;
}

function formatTzLabel(offsetMinutes: number): string {
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

// Compute unit data in edge runtime with timezone offset
function computeUnitData(unitId: string, timestampMs: number, offsetMinutes: number) {
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const localMs = timestampMs + offsetMinutes * 60 * 1000;
  const localDate = new Date(localMs);

  const year = localDate.getUTCFullYear();
  const month = localDate.getUTCMonth();
  const date = localDate.getUTCDate();
  const dayOfWeek = localDate.getUTCDay();
  const hours = localDate.getUTCHours();
  const minutes = localDate.getUTCMinutes();
  const seconds = localDate.getUTCSeconds();
  const ms = localDate.getUTCMilliseconds();

  switch (unitId.toLowerCase()) {
    case 'second': {
      const elapsed = ms;
      const total = 1000;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: 'Second Progress',
        section: 'Micro Scale',
        color: '#14b8a6',
        pct,
        elapsed: `${elapsed}ms`,
        remaining: `${remaining}ms`,
        period: `Current Second: :${String(seconds).padStart(2, '0')}`,
      };
    }
    case 'minute': {
      const elapsed = seconds * 1000 + ms;
      const total = 60 * 1000;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: 'Minute Progress',
        section: 'Micro Scale',
        color: '#06b6d4',
        pct,
        elapsed: `${seconds}s`,
        remaining: `${60 - seconds}s`,
        period: `Current Minute: ${minutes}m`,
      };
    }
    case 'hour': {
      const elapsed = minutes * MS_PER_MINUTE + seconds * 1000 + ms;
      const total = MS_PER_HOUR;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: 'Hour Progress',
        section: 'Micro Scale',
        color: '#3b82f6',
        pct,
        elapsed: formatMsDuration(elapsed),
        remaining: formatMsDuration(remaining),
        period: `Hour ${hours}:00 - ${(hours + 1) % 24}:00`,
      };
    }
    case 'heartbeat': {
      const cycle = 800;
      const elapsed = localMs % cycle;
      const remaining = cycle - elapsed;
      const pct = (elapsed / cycle) * 100;
      return {
        label: 'Heartbeat Rhythm',
        section: 'Micro Scale',
        color: '#ef4444',
        pct,
        elapsed: `${elapsed}ms`,
        remaining: `${remaining}ms`,
        period: 'Systolic & Diastolic Cycle (~75 BPM)',
      };
    }
    case 'day': {
      const startOfDay = Date.UTC(year, month, date);
      const endOfDay = Date.UTC(year, month, date + 1);
      const total = endOfDay - startOfDay;
      const elapsed = localMs - startOfDay;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: 'Day Progress',
        section: 'Cyclical Scale',
        color: '#0ea5e9',
        pct,
        elapsed: formatMsDuration(elapsed),
        remaining: formatMsDuration(remaining),
        period: `Today: ${MONTH_SHORT[month]} ${date}, ${year}`,
      };
    }
    case 'daylight': {
      const startOfYear = Date.UTC(year, 0, 1);
      const dayOfYear = Math.floor((localMs - startOfYear) / MS_PER_DAY);
      const sunlightHours = 12 + 3 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 80));
      const solarNoon = 12;
      const sunrise = solarNoon - sunlightHours / 2;
      const sunset = solarNoon + sunlightHours / 2;
      const currentHour = hours + minutes / 60 + seconds / 3600;
      const total = sunlightHours * MS_PER_HOUR;
      let elapsed = 0;
      if (currentHour < sunrise) elapsed = 0;
      else if (currentHour > sunset) elapsed = total;
      else elapsed = (currentHour - sunrise) * MS_PER_HOUR;
      const remaining = total - elapsed;
      const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
      return {
        label: 'Daylight Progress',
        section: 'Cyclical Scale',
        color: '#f59e0b',
        pct,
        elapsed: formatMsDuration(elapsed, true),
        remaining: formatMsDuration(remaining, true),
        period: `Sun Cycle (~${sunlightHours.toFixed(1)}h Daylight)`,
      };
    }
    case 'week': {
      const startOfWeek = Date.UTC(year, month, date - dayOfWeek);
      const endOfWeek = startOfWeek + 7 * MS_PER_DAY;
      const total = endOfWeek - startOfWeek;
      const elapsed = localMs - startOfWeek;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: 'Week Progress',
        section: 'Cyclical Scale',
        color: '#10b981',
        pct,
        elapsed: formatMsDuration(elapsed),
        remaining: formatMsDuration(remaining),
        period: `Current Week (${WEEKDAY_NAMES[dayOfWeek]})`,
      };
    }
    case 'moon': {
      const synodicMonth = 29.53058867 * MS_PER_DAY;
      const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
      let elapsed = (timestampMs - knownNewMoon) % synodicMonth;
      if (elapsed < 0) elapsed += synodicMonth;
      const remaining = synodicMonth - elapsed;
      const pct = (elapsed / synodicMonth) * 100;
      let phase = "New Moon";
      if (pct > 2 && pct < 23) phase = "Waxing Crescent";
      else if (pct >= 23 && pct < 27) phase = "First Quarter";
      else if (pct >= 27 && pct < 48) phase = "Waxing Gibbous";
      else if (pct >= 48 && pct < 52) phase = "Full Moon";
      else if (pct >= 52 && pct < 73) phase = "Waning Gibbous";
      else if (pct >= 73 && pct < 77) phase = "Last Quarter";
      else if (pct >= 77 && pct < 98) phase = "Waning Crescent";
      return {
        label: 'Lunar Phase Progress',
        section: 'Cyclical Scale',
        color: '#94a3b8',
        pct,
        elapsed: `${(elapsed / MS_PER_DAY).toFixed(1)} days`,
        remaining: `${(remaining / MS_PER_DAY).toFixed(1)} days`,
        period: `Lunar Cycle: ${phase}`,
      };
    }
    case 'month': {
      const startOfMonth = Date.UTC(year, month, 1);
      const endOfMonth = Date.UTC(year, month + 1, 1);
      const total = endOfMonth - startOfMonth;
      const elapsed = localMs - startOfMonth;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: 'Month Progress',
        section: 'Macro Scale',
        color: '#8b5cf6',
        pct,
        elapsed: formatMsDuration(elapsed),
        remaining: formatMsDuration(remaining),
        period: `${MONTH_NAMES[month]} ${year}`,
      };
    }
    case 'quarter': {
      const q = Math.floor(month / 3) + 1;
      const startQuarter = Date.UTC(year, (q - 1) * 3, 1);
      const endQuarter = Date.UTC(year, q * 3, 1);
      const total = endQuarter - startQuarter;
      const elapsed = localMs - startQuarter;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: 'Quarter Progress',
        section: 'Macro Scale',
        color: '#f97316',
        pct,
        elapsed: formatMsDuration(elapsed, true),
        remaining: formatMsDuration(remaining, true),
        period: `Q${q} ${year}`,
      };
    }
    case 'season': {
      let seasonName = 'Winter';
      let startMonth = 11;
      let startYear = year;
      let endMonth = 2;
      let endYear = year + 1;
      if (month >= 2 && month <= 4) {
        seasonName = 'Spring';
        startMonth = 2; endMonth = 5;
        startYear = year; endYear = year;
      } else if (month >= 5 && month <= 7) {
        seasonName = 'Summer';
        startMonth = 5; endMonth = 8;
        startYear = year; endYear = year;
      } else if (month >= 8 && month <= 10) {
        seasonName = 'Autumn';
        startMonth = 8; endMonth = 11;
        startYear = year; endYear = year;
      } else if (month < 2) {
        startMonth = 11; endMonth = 2;
        startYear = year - 1; endYear = year;
      }
      const start = Date.UTC(startYear, startMonth, 1);
      const end = Date.UTC(endYear, endMonth, 1);
      const total = end - start;
      const elapsed = localMs - start;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: `${seasonName} Season`,
        section: 'Macro Scale',
        color: '#84cc16',
        pct,
        elapsed: formatMsDuration(elapsed, true),
        remaining: formatMsDuration(remaining, true),
        period: `${seasonName} ${year} (Meteorological)`,
      };
    }
    case 'year': {
      const startOfYear = Date.UTC(year, 0, 1);
      const endOfYear = Date.UTC(year + 1, 0, 1);
      const total = endOfYear - startOfYear;
      const elapsed = localMs - startOfYear;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      const dayOfYear = Math.floor(elapsed / MS_PER_DAY) + 1;
      const totalDays = Math.round(total / MS_PER_DAY);
      return {
        label: `Year ${year} Progress`,
        section: 'Macro Scale',
        color: '#f43f5e',
        pct,
        elapsed: formatMsDuration(elapsed, true),
        remaining: formatMsDuration(remaining, true),
        period: `Day ${dayOfYear} of ${totalDays} in ${year}`,
      };
    }
    case 'decade': {
      const startDecadeYear = Math.floor(year / 10) * 10;
      const start = Date.UTC(startDecadeYear, 0, 1);
      const end = Date.UTC(startDecadeYear + 10, 0, 1);
      const total = end - start;
      const elapsed = localMs - start;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      return {
        label: `${startDecadeYear}s Decade Progress`,
        section: 'Mega Scale',
        color: '#6366f1',
        pct,
        elapsed: formatMsDuration(elapsed, true),
        remaining: formatMsDuration(remaining, true),
        period: `Decade ${startDecadeYear} - ${startDecadeYear + 9}`,
      };
    }
    case 'century': {
      const centuryStartYear = Math.floor(year / 100) * 100;
      const start = Date.UTC(centuryStartYear, 0, 1);
      const end = Date.UTC(centuryStartYear + 100, 0, 1);
      const total = end - start;
      const elapsed = localMs - start;
      const remaining = total - elapsed;
      const pct = (elapsed / total) * 100;
      const centuryNum = Math.floor(year / 100) + 1;
      return {
        label: `${centuryNum}${centuryNum === 21 ? 'st' : 'th'} Century Progress`,
        section: 'Mega Scale',
        color: '#64748b',
        pct,
        elapsed: `${Math.floor(elapsed / (MS_PER_DAY * 365))} years`,
        remaining: `${Math.floor(remaining / (MS_PER_DAY * 365))} years`,
        period: `Century ${centuryStartYear} - ${centuryStartYear + 99}`,
      };
    }
    case 'life': {
      const birth = Date.UTC(1990, 0, 1);
      const lifespan = 72 * 365.25 * MS_PER_DAY;
      const elapsed = localMs - birth;
      const remaining = lifespan - elapsed;
      const pct = Math.max(0, Math.min(100, (elapsed / lifespan) * 100));
      return {
        label: 'Life Expectancy Progress',
        section: 'Mega Scale',
        color: '#db2777',
        pct,
        elapsed: `${(elapsed / (MS_PER_DAY * 365.25)).toFixed(1)} years`,
        remaining: `${(remaining / (MS_PER_DAY * 365.25)).toFixed(1)} years`,
        period: 'Standard Baseline (72 Year Avg)',
      };
    }
    default:
      return null;
  }
}

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const item = searchParams.get('item') || searchParams.get('unit') || searchParams.get('card');

    // Parse timezone offset (tz, offset, tzOffset)
    const tzParam = searchParams.get('tz') || searchParams.get('offset') || searchParams.get('tzOffset');
    const offsetMinutes = parseUtcOffset(tzParam);
    const tzLabel = formatTzLabel(offsetMinutes);

    // Clock time is strictly live current time, shifted solely by timezone offset
    // Parameters like 'v' or 't' serve purely for URL uniqueness and CDN cache-busting
    const timestampMs = Date.now();
    const localMs = timestampMs + offsetMinutes * 60 * 1000;
    const localDate = new Date(localMs);

    const year = localDate.getUTCFullYear();
    const month = localDate.getUTCMonth();
    const date = localDate.getUTCDate();
    const dayOfWeek = localDate.getUTCDay();
    const hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes();
    const seconds = localDate.getUTCSeconds();

    const dateFormatted = `${WEEKDAY_SHORT[dayOfWeek]}, ${MONTH_SHORT[month]} ${date}, ${year}`;
    const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // 1. SPECIFIC TIME UNIT OPEN GRAPH CARD (e.g. ?item=year, ?item=day, ?item=month, etc.)
    if (item) {
      const unitData = computeUnitData(item, timestampMs, offsetMinutes);

      if (unitData) {
        const pctFormatted = unitData.pct.toFixed(2);
        const clampedPct = Math.max(0, Math.min(100, unitData.pct));

        return new ImageResponse(
          (
            <div
              style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#020617',
                backgroundImage: `radial-gradient(circle at 15% 15%, ${unitData.color}25 0%, transparent 40%), radial-gradient(circle at 85% 85%, #38bdf818 0%, transparent 45%)`,
                padding: '48px 56px',
                color: '#f8fafc',
                fontFamily: 'sans-serif',
                position: 'relative',
              }}
            >
              {/* Subtle tech border outline */}
              <div
                style={{
                  position: 'absolute',
                  inset: '20px',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: '24px',
                  pointerEvents: 'none',
                }}
              />

              {/* Top Navigation / Brand Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: unitData.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 24px ${unitData.color}80`,
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                      TIME FLUX
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.15em' }}>
                      REAL-TIME EXISTENCE TRACKER
                    </span>
                  </div>
                </div>

                {/* Section Badge & Live Clock */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      backgroundColor: `${unitData.color}22`,
                      border: `1px solid ${unitData.color}55`,
                      color: unitData.color,
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {unitData.section}
                  </div>
                  <div
                    style={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      color: '#cbd5e1',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    {timeFormatted} ({tzLabel})
                  </div>
                </div>
              </div>

              {/* Main Card Content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#0f172a88',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '32px 40px',
                  marginTop: '16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '38px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                      {unitData.label}
                    </span>
                    <span style={{ fontSize: '18px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
                      {unitData.period}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span
                      style={{
                        fontSize: '68px',
                        fontWeight: 900,
                        color: unitData.color,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        textShadow: `0 0 35px ${unitData.color}66`,
                      }}
                    >
                      {pctFormatted}
                    </span>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: unitData.color }}>%</span>
                  </div>
                </div>

                {/* Main Progress Bar Container */}
                <div
                  style={{
                    width: '100%',
                    height: '28px',
                    backgroundColor: '#1e293b',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: `${clampedPct}%`,
                      height: '100%',
                      backgroundColor: unitData.color,
                      borderRadius: '14px',
                      display: 'flex',
                      boxShadow: `0 0 20px ${unitData.color}`,
                    }}
                  />
                </div>

                {/* Sub-Details Metrics Grid */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      ELAPSED
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }}>
                      {unitData.elapsed}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      REMAINING
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }}>
                      {unitData.remaining}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      CURRENT STATUS
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: unitData.color, marginTop: '2px' }}>
                      {clampedPct >= 100 ? 'Completed' : `${(100 - clampedPct).toFixed(1)}% Left`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                <span>{dateFormatted} ({tzLabel}) • Live Precision Calculation</span>
                <span style={{ fontWeight: 600, color: '#38bdf8' }}>Visualize time progress in real-time</span>
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 630,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }
        );
      }
    }

    // 2. DEFAULT OVERVIEW OPEN GRAPH IMAGE (Comprehensive multi-unit dashboard)
    const yearData = computeUnitData('year', timestampMs, offsetMinutes)!;
    const monthData = computeUnitData('month', timestampMs, offsetMinutes)!;
    const weekData = computeUnitData('week', timestampMs, offsetMinutes)!;
    const dayData = computeUnitData('day', timestampMs, offsetMinutes)!;
    const hourData = computeUnitData('hour', timestampMs, offsetMinutes)!;
    const decadeData = computeUnitData('decade', timestampMs, offsetMinutes)!;

    const cards = [
      { label: 'Year', data: yearData, color: '#f43f5e' },
      { label: 'Month', data: monthData, color: '#8b5cf6' },
      { label: 'Week', data: weekData, color: '#10b981' },
      { label: 'Day', data: dayData, color: '#0ea5e9' },
      { label: 'Hour', data: hourData, color: '#3b82f6' },
      { label: 'Decade', data: decadeData, color: '#6366f1' },
    ];

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#020617',
            backgroundImage:
              'radial-gradient(circle at 10% 20%, #38bdf825 0%, transparent 35%), radial-gradient(circle at 90% 80%, #f43f5e20 0%, transparent 40%)',
            padding: '44px 52px',
            color: '#f8fafc',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Subtle frame border */}
          <div
            style={{
              position: 'absolute',
              inset: '18px',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '24px',
              pointerEvents: 'none',
            }}
          />

          {/* Top Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 28px rgba(14, 165, 233, 0.6)',
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  TIME FLUX
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.15em' }}>
                  REAL-TIME EXISTENCE PROGRESS TRACKER
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#94a3b8',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                {dateFormatted} • {timeFormatted} ({tzLabel})
              </div>
            </div>
          </div>

          {/* 6-Card Dashboard Matrix */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'space-between',
              margin: '20px 0',
            }}
          >
            {cards.map((card, idx) => {
              const pct = card.data.pct;
              const clampedPct = Math.max(0, Math.min(100, pct));
              return (
                <div
                  key={idx}
                  style={{
                    width: '350px',
                    backgroundColor: '#0f172a99',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: card.color,
                          boxShadow: `0 0 10px ${card.color}`,
                        }}
                      />
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                        {card.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        color: card.color,
                      }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      backgroundColor: '#1e293b',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      marginTop: '12px',
                      marginBottom: '10px',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        width: `${clampedPct}%`,
                        height: '100%',
                        backgroundColor: card.color,
                        borderRadius: '5px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <span>{card.data.elapsed}</span>
                    <span>{card.data.remaining} left</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: '14px',
              color: '#64748b',
            }}
          >
            <span>Live visual tracking across 15+ micro, cyclical, macro & mega scales</span>
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>Shareable Deep Link Enabled</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate Open Graph image: ${e.message}`, { status: 500 });
  }
}
