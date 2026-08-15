export const config = {
  runtime: 'edge',
};

const UNIT_INFO: Record<string, { label: string; section: string; color: string; desc: string }> = {
  second: {
    label: 'Second Progress',
    section: 'Micro Scale',
    color: '#14b8a6',
    desc: 'Live real-time millisecond flow of the current second.',
  },
  minute: {
    label: 'Minute Progress',
    section: 'Micro Scale',
    color: '#06b6d4',
    desc: 'Live tracking of seconds elapsed in the current minute.',
  },
  hour: {
    label: 'Hour Progress',
    section: 'Micro Scale',
    color: '#3b82f6',
    desc: 'Visualizing minutes elapsed and remaining in the current hour.',
  },
  heartbeat: {
    label: 'Heartbeat Rhythm',
    section: 'Micro Scale',
    color: '#ef4444',
    desc: 'Simulating the average 800ms cardiac cycle in real-time.',
  },
  day: {
    label: 'Day Progress',
    section: 'Cyclical Scale',
    color: '#0ea5e9',
    desc: '24-hour diurnal cycle tracker showing hours elapsed today.',
  },
  daylight: {
    label: 'Daylight Progress',
    section: 'Cyclical Scale',
    color: '#f59e0b',
    desc: 'Tracking the solar cycle between sunrise and sunset.',
  },
  week: {
    label: 'Week Progress',
    section: 'Cyclical Scale',
    color: '#10b981',
    desc: 'Visualizing weekly progress across days and work cycles.',
  },
  moon: {
    label: 'Moon Phase',
    section: 'Cyclical Scale',
    color: '#94a3b8',
    desc: 'Live synodic lunar cycle and illumination tracker.',
  },
  month: {
    label: 'Month Progress',
    section: 'Macro Scale',
    color: '#8b5cf6',
    desc: 'Tracking days elapsed and remaining in the current month.',
  },
  quarter: {
    label: 'Quarter Progress',
    section: 'Macro Scale',
    color: '#f97316',
    desc: 'Financial and seasonal 3-month quarterly progress tracker.',
  },
  year: {
    label: 'Year Progress',
    section: 'Macro Scale',
    color: '#f43f5e',
    desc: 'Track the flow of the current year with precise percentage and remaining days.',
  },
  season: {
    label: 'Season Progress',
    section: 'Macro Scale',
    color: '#84cc16',
    desc: 'Tracking the astronomical and meteorological season progress.',
  },
  decade: {
    label: 'Decade Progress',
    section: 'Mega Scale',
    color: '#6366f1',
    desc: '10-year span progress tracker for the current decade.',
  },
  century: {
    label: 'Century Progress',
    section: 'Mega Scale',
    color: '#64748b',
    desc: '100-year epoch tracker showing elapsed time in the 21st century.',
  },
  life: {
    label: 'Life Expectancy',
    section: 'Mega Scale',
    color: '#db2777',
    desc: 'Memento mori existence visualizer based on statistical human lifespan.',
  },
};

function getTitleAndDesc(item: string | null, now: Date) {
  if (!item) {
    return {
      title: 'Time Flux - Real-Time Existence Tracker',
      description: 'A sleek, real-time web application visualizing the flow of existence across micro, cyclical, macro, and mega time units with live progress bars.',
      label: 'Overview',
    };
  }

  const key = item.toLowerCase();
  const info = UNIT_INFO[key];
  const year = now.getFullYear();

  if (info) {
    if (key === 'year') {
      const start = new Date(year, 0, 1).getTime();
      const end = new Date(year + 1, 0, 1).getTime();
      const pct = (((now.getTime() - start) / (end - start)) * 100).toFixed(1);
      return {
        title: `${year} Year Progress (${pct}%) - Time Flux`,
        description: `Visualizing ${year}: ${pct}% completed. Live progress bar tracking the flow of existence.`,
        label: info.label,
      };
    }

    if (key === 'month') {
      const monthName = now.toLocaleString('en-US', { month: 'long' });
      return {
        title: `${monthName} ${year} Progress - Time Flux`,
        description: `Visualizing the progress of ${monthName} ${year} in real time with dynamic progress indicators.`,
        label: info.label,
      };
    }

    return {
      title: `${info.label} - Time Flux`,
      description: `${info.desc} Track real-time progress live on Time Flux.`,
      label: info.label,
    };
  }

  const formatted = item.charAt(0).toUpperCase() + item.slice(1);
  return {
    title: `${formatted} Progress - Time Flux`,
    description: `Live real-time progress tracker for ${formatted} on Time Flux.`,
    label: `${formatted} Progress`,
  };
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const now = new Date();

  const item = url.searchParams.get('item') || url.searchParams.get('unit');
  const mode = url.searchParams.get('mode') || '';
  const theme = url.searchParams.get('theme') || '';
  const tz = url.searchParams.get('tz') || url.searchParams.get('offset') || url.searchParams.get('tzOffset');
  const t = url.searchParams.get('t') || url.searchParams.get('ts') || url.searchParams.get('time') || String(Date.now());
  const v = url.searchParams.get('v') || url.searchParams.get('nonce') || '';
  const tab = url.searchParams.get('tab') || '';

  // Determine external Origin with protocol and host
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  const { title, description } = getTitleAndDesc(item, now);

  // Construct absolute canonical URL and OG image URL with full cache-busting and timezone context
  const canonicalUrl = `${origin}${url.pathname}${url.search}`;
  const ogParams = new URLSearchParams();
  if (item) ogParams.set('item', item);
  if (mode) ogParams.set('mode', mode);
  if (theme) ogParams.set('theme', theme);
  if (tab) ogParams.set('tab', tab);
  if (tz) ogParams.set('tz', tz);
  if (t) ogParams.set('t', t);
  if (v) ogParams.set('v', v);

  const ogParamString = ogParams.toString();
  const ogImageUrl = `${origin}/api/og${ogParamString ? `?${ogParamString}` : ''}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Open Graph / Facebook / WhatsApp / Discord / LinkedIn / Telegram -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Time Flux">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@TimeFlux">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl}">
  <meta name="twitter:image:alt" content="${title}">

  <!-- Canonical link -->
  <link rel="canonical" href="${canonicalUrl}">

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
            orbitron: ['Orbitron', 'sans-serif'],
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out forwards',
          },
        }
      }
    }
  </script>
  <script>
    const storedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme === 'dark' || (!storedTheme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;500;700&display=swap" rel="stylesheet">
  <script type="importmap">
  {
    "imports": {
      "react/": "https://esm.sh/react@^19.1.0/",
      "react": "https://esm.sh/react@^19.1.0",
      "react-dom/": "https://esm.sh/react-dom@^19.1.0/",
      "react-dom": "https://aistudiocdn.com/react-dom@^19.2.0"
    }
  }
  </script>
  <link rel="stylesheet" href="/index.css">
</head>
<body class="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out overflow-x-hidden">
  <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'pragma': 'no-cache',
      'expires': '0',
      'x-robots-tag': 'all',
    },
  });
}
