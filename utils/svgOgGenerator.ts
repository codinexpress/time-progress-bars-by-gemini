// SVG Open Graph Generator for dev server fallback and client preview export

export function generateSvgOgImage(params: {
  item?: string | null;
  tab?: string | null;
}): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const item = params.item?.toLowerCase();

  // Helper for single unit
  const computeUnit = (unitId: string) => {
    switch (unitId) {
      case 'year': {
        const startOfYear = new Date(year, 0, 1).getTime();
        const endOfYear = new Date(year + 1, 0, 1).getTime();
        const total = endOfYear - startOfYear;
        const elapsed = now.getTime() - startOfYear;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        const dayOfYear = Math.floor(elapsed / MS_PER_DAY) + 1;
        const totalDays = Math.round(total / MS_PER_DAY);
        return {
          label: `Year ${year} Progress`,
          section: 'Macro Scale',
          color: '#f43f5e',
          pct,
          elapsed: `${Math.floor(elapsed / MS_PER_DAY)}d ${Math.floor((elapsed % MS_PER_DAY) / MS_PER_HOUR)}h`,
          remaining: `${Math.floor(remaining / MS_PER_DAY)}d ${Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR)}h`,
          period: `Day ${dayOfYear} of ${totalDays} in ${year}`,
        };
      }
      case 'month': {
        const start = new Date(year, month, 1).getTime();
        const end = new Date(year, month + 1, 1).getTime();
        const total = end - start;
        const elapsed = now.getTime() - start;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        return {
          label: 'Month Progress',
          section: 'Macro Scale',
          color: '#8b5cf6',
          pct,
          elapsed: `${Math.floor(elapsed / MS_PER_DAY)}d ${Math.floor((elapsed % MS_PER_DAY) / MS_PER_HOUR)}h`,
          remaining: `${Math.floor(remaining / MS_PER_DAY)}d ${Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR)}h`,
          period: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
      }
      case 'week': {
        const dayOfWeek = now.getDay();
        const start = new Date(year, month, date - dayOfWeek).getTime();
        const total = 7 * MS_PER_DAY;
        const elapsed = now.getTime() - start;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        return {
          label: 'Week Progress',
          section: 'Cyclical Scale',
          color: '#10b981',
          pct,
          elapsed: `${Math.floor(elapsed / MS_PER_DAY)}d ${Math.floor((elapsed % MS_PER_DAY) / MS_PER_HOUR)}h`,
          remaining: `${Math.floor(remaining / MS_PER_DAY)}d ${Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR)}h`,
          period: `Current Week (${now.toLocaleDateString('en-US', { weekday: 'long' })})`,
        };
      }
      case 'day': {
        const start = new Date(year, month, date).getTime();
        const total = MS_PER_DAY;
        const elapsed = now.getTime() - start;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        return {
          label: 'Day Progress',
          section: 'Cyclical Scale',
          color: '#0ea5e9',
          pct,
          elapsed: `${Math.floor(elapsed / MS_PER_HOUR)}h ${Math.floor((elapsed % MS_PER_HOUR) / MS_PER_MINUTE)}m`,
          remaining: `${Math.floor(remaining / MS_PER_HOUR)}h ${Math.floor((remaining % MS_PER_HOUR) / MS_PER_MINUTE)}m`,
          period: `Today: ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        };
      }
      case 'hour': {
        const elapsed = now.getMinutes() * MS_PER_MINUTE + now.getSeconds() * 1000;
        const total = MS_PER_HOUR;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        return {
          label: 'Hour Progress',
          section: 'Micro Scale',
          color: '#3b82f6',
          pct,
          elapsed: `${now.getMinutes()}m ${now.getSeconds()}s`,
          remaining: `${59 - now.getMinutes()}m ${59 - now.getSeconds()}s`,
          period: `Hour ${now.getHours()}:00 - ${now.getHours() + 1}:00`,
        };
      }
      case 'decade': {
        const startDecadeYear = Math.floor(year / 10) * 10;
        const start = new Date(startDecadeYear, 0, 1).getTime();
        const end = new Date(startDecadeYear + 10, 0, 1).getTime();
        const total = end - start;
        const elapsed = now.getTime() - start;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        return {
          label: `${startDecadeYear}s Decade`,
          section: 'Mega Scale',
          color: '#6366f1',
          pct,
          elapsed: `${(elapsed / (MS_PER_DAY * 365.25)).toFixed(1)}y`,
          remaining: `${(remaining / (MS_PER_DAY * 365.25)).toFixed(1)}y`,
          period: `Decade ${startDecadeYear} - ${startDecadeYear + 9}`,
        };
      }
      case 'century': {
        const centuryStart = Math.floor(year / 100) * 100;
        const start = new Date(centuryStart, 0, 1).getTime();
        const end = new Date(centuryStart + 100, 0, 1).getTime();
        const total = end - start;
        const elapsed = now.getTime() - start;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        const centuryNum = Math.floor(year / 100) + 1;
        return {
          label: `${centuryNum}${centuryNum === 21 ? 'st' : 'th'} Century`,
          section: 'Mega Scale',
          color: '#64748b',
          pct,
          elapsed: `${Math.floor(elapsed / (MS_PER_DAY * 365))} years`,
          remaining: `${Math.floor(remaining / (MS_PER_DAY * 365))} years`,
          period: `Century ${centuryStart} - ${centuryStart + 99}`,
        };
      }
      case 'quarter': {
        const q = Math.floor(month / 3) + 1;
        const start = new Date(year, (q - 1) * 3, 1).getTime();
        const end = new Date(year, q * 3, 1).getTime();
        const total = end - start;
        const elapsed = now.getTime() - start;
        const remaining = total - elapsed;
        const pct = (elapsed / total) * 100;
        return {
          label: `Q${q} ${year} Quarter`,
          section: 'Macro Scale',
          color: '#f97316',
          pct,
          elapsed: `${Math.floor(elapsed / MS_PER_DAY)}d ${Math.floor((elapsed % MS_PER_DAY) / MS_PER_HOUR)}h`,
          remaining: `${Math.floor(remaining / MS_PER_DAY)}d ${Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR)}h`,
          period: `Quarter ${q} (${year})`,
        };
      }
      default: {
        return computeUnit('year');
      }
    }
  };

  // Specific single item card
  if (item && item !== 'all') {
    const unit = computeUnit(item);
    const clampedPct = Math.max(0, Math.min(100, unit.pct));
    const barWidth = Math.round((clampedPct / 100) * 1000);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
      <defs>
        <radialGradient id="bgGlow1" cx="15%" cy="15%" r="50%">
          <stop offset="0%" stop-color="${unit.color}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#020617" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="bgGlow2" cx="85%" cy="85%" r="60%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#020617" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${unit.color}" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="#020617" />
      <rect width="1200" height="630" fill="url(#bgGlow1)" />
      <rect width="1200" height="630" fill="url(#bgGlow2)" />

      <!-- Outer Frame -->
      <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="rgba(148, 163, 184, 0.15)" stroke-width="1.5" />

      <!-- Header -->
      <g transform="translate(60, 64)">
        <rect width="44" height="44" rx="12" fill="${unit.color}" filter="url(#glow)" />
        <circle cx="22" cy="22" r="8" fill="#ffffff" />
        <text x="60" y="24" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5">TIME FLUX</text>
        <text x="60" y="42" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2">REAL-TIME EXISTENCE TRACKER</text>
      </g>

      <!-- Badge & Live Clock -->
      <g transform="translate(860, 64)">
        <rect x="0" y="0" width="130" height="36" rx="18" fill="${unit.color}22" stroke="${unit.color}66" stroke-width="1" />
        <text x="65" y="23" fill="${unit.color}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle" letter-spacing="1">${unit.section.toUpperCase()}</text>
        
        <rect x="142" y="0" width="138" height="36" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <circle cx="158" cy="18" r="4" fill="#22c55e" />
        <text x="170" y="23" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">${timeFormatted} UTC</text>
      </g>

      <!-- Center Card Container -->
      <rect x="60" y="136" width="1080" height="360" rx="20" fill="#0f172a" fill-opacity="0.85" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />

      <!-- Title & Percentage -->
      <g transform="translate(100, 195)">
        <text x="0" y="0" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="800" letter-spacing="-0.5">${unit.label}</text>
        <text x="0" y="32" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500">${unit.period}</text>

        <text x="1000" y="10" fill="${unit.color}" font-family="system-ui, -apple-system, sans-serif" font-size="68" font-weight="900" text-anchor="end" filter="url(#glow)">${unit.pct.toFixed(2)}<tspan font-size="36" font-weight="700">%</tspan></text>
      </g>

      <!-- Progress Bar Track -->
      <g transform="translate(100, 275)">
        <rect x="0" y="0" width="1000" height="28" rx="14" fill="#1e293b" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        <rect x="0" y="0" width="${barWidth}" height="28" rx="14" fill="url(#barGrad)" filter="url(#glow)" />
      </g>

      <!-- Stat Columns -->
      <g transform="translate(100, 370)">
        <line x1="0" y1="0" x2="1000" y2="0" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1" />

        <!-- Col 1 -->
        <text x="0" y="32" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">ELAPSED</text>
        <text x="0" y="62" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">${unit.elapsed}</text>

        <!-- Col 2 -->
        <text x="350" y="32" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">REMAINING</text>
        <text x="350" y="62" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">${unit.remaining}</text>

        <!-- Col 3 -->
        <text x="700" y="32" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">COMPLETION STATUS</text>
        <text x="700" y="62" fill="${unit.color}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">${clampedPct >= 100 ? 'Completed' : (100 - clampedPct).toFixed(1) + '% Remaining'}</text>
      </g>

      <!-- Bottom Footer -->
      <g transform="translate(60, 560)">
        <text x="0" y="0" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14">${dateFormatted} • High Precision Time Flow</text>
        <text x="1080" y="0" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="end">timeflux.app • Visualize the flow of existence</text>
      </g>
    </svg>`;
  }

  // Multi-card Overview Dashboard
  const yearData = computeUnit('year');
  const monthData = computeUnit('month');
  const weekData = computeUnit('week');
  const dayData = computeUnit('day');
  const hourData = computeUnit('hour');
  const decadeData = computeUnit('decade');

  const cards = [
    { label: 'Year', data: yearData, x: 60, y: 140, color: '#f43f5e' },
    { label: 'Month', data: monthData, x: 430, y: 140, color: '#8b5cf6' },
    { label: 'Week', data: weekData, x: 800, y: 140, color: '#10b981' },
    { label: 'Day', data: dayData, x: 60, y: 320, color: '#0ea5e9' },
    { label: 'Hour', data: hourData, x: 430, y: 320, color: '#3b82f6' },
    { label: 'Decade', data: decadeData, x: 800, y: 320, color: '#6366f1' },
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
    <defs>
      <radialGradient id="bgGlowMain1" cx="10%" cy="20%" r="50%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="bgGlowMain2" cx="90%" cy="80%" r="60%">
        <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.20" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect width="1200" height="630" fill="#020617" />
    <rect width="1200" height="630" fill="url(#bgGlowMain1)" />
    <rect width="1200" height="630" fill="url(#bgGlowMain2)" />

    <!-- Outer Frame -->
    <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="rgba(148, 163, 184, 0.15)" stroke-width="1.5" />

    <!-- Top Header -->
    <g transform="translate(60, 64)">
      <rect width="48" height="48" rx="14" fill="#0ea5e9" />
      <circle cx="24" cy="24" r="10" fill="#ffffff" />
      <text x="66" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" letter-spacing="-0.5">TIME FLUX</text>
      <text x="66" y="45" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2">REAL-TIME EXISTENCE PROGRESS TRACKER</text>
    </g>

    <g transform="translate(860, 68)">
      <rect x="0" y="0" width="280" height="40" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <circle cx="20" cy="20" r="4" fill="#22c55e" />
      <text x="34" y="25" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">${dateFormatted} • ${timeFormatted} UTC</text>
    </g>

    <!-- Cards Matrix -->
    ${cards.map(c => {
      const clampedPct = Math.max(0, Math.min(100, c.data.pct));
      const barW = Math.round((clampedPct / 100) * 300);
      return `
        <g transform="translate(${c.x}, ${c.y})">
          <rect width="340" height="155" rx="16" fill="#0f172a" fill-opacity="0.9" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
          <circle cx="28" cy="28" r="5" fill="${c.color}" />
          <text x="44" y="34" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700">${c.label}</text>
          <text x="316" y="34" fill="${c.color}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" text-anchor="end">${c.data.pct.toFixed(1)}%</text>

          <!-- Bar -->
          <rect x="24" y="55" width="292" height="10" rx="5" fill="#1e293b" />
          <rect x="24" y="55" width="${(clampedPct / 100) * 292}" height="10" rx="5" fill="${c.color}" />

          <!-- Stats -->
          <text x="24" y="98" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">ELAPSED</text>
          <text x="24" y="122" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700">${c.data.elapsed}</text>

          <text x="170" y="98" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">REMAINING</text>
          <text x="170" y="122" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700">${c.data.remaining}</text>
        </g>
      `;
    }).join('')}

    <!-- Footer -->
    <g transform="translate(60, 560)">
      <text x="0" y="0" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14">Live visual tracking across micro, cyclical, macro &amp; mega time units</text>
      <text x="1080" y="0" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="end">Deep-Link &amp; Social Cards Enabled</text>
    </g>
  </svg>`;
}
