export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - static files with extensions (.js, .css, .png, .jpg, .svg, .ico, .json, etc.)
     */
    '/((?!api|_next|assets|static|.*\\..*).*)',
  ],
};

const UNIT_LABELS: Record<string, string> = {
  second: 'Second',
  minute: 'Minute',
  hour: 'Hour',
  heartbeat: 'Heartbeat',
  day: 'Day',
  daylight: 'Daylight',
  week: 'Week',
  moon: 'Moon Phase',
  month: 'Month',
  quarter: 'Quarter',
  year: 'Year',
  season: 'Season',
  decade: 'Decade',
  century: 'Century',
  life: 'Life Expectancy',
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const item = url.searchParams.get('item') || url.searchParams.get('unit');
  const tz = url.searchParams.get('tz') || url.searchParams.get('offset') || url.searchParams.get('tzOffset');
  const t = url.searchParams.get('t') || url.searchParams.get('ts') || url.searchParams.get('time') || String(Date.now());
  const v = url.searchParams.get('v') || url.searchParams.get('nonce') || '';
  const mode = url.searchParams.get('mode') || '';
  const theme = url.searchParams.get('theme') || '';
  const tab = url.searchParams.get('tab') || '';

  try {
    const indexUrl = new URL('/index.html', request.url);
    const originResponse = await fetch(indexUrl);
    if (!originResponse.ok) {
      return;
    }
    let html = await originResponse.text();

    const host = request.headers.get('host') || url.host;
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const origin = `${proto}://${host}`;

    let title = 'Time Flux - Real-Time Existence Tracker';
    let description = 'Visualize the flow of existence across second, minute, hour, day, week, month, year, decade, and century with live progress bars.';

    if (item) {
      if (UNIT_LABELS[item.toLowerCase()]) {
        const unitName = UNIT_LABELS[item.toLowerCase()];
        title = `${unitName} Progress - Time Flux`;
        description = `Live real-time progress tracker for the current ${unitName.toLowerCase()} on Time Flux.`;
      } else {
        const formatted = item.charAt(0).toUpperCase() + item.slice(1);
        title = `${formatted} Progress - Time Flux`;
        description = `Live real-time progress tracker for ${formatted} on Time Flux.`;
      }
    }

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
    const canonicalUrl = `${origin}${url.pathname}${url.search}`;

    // Replace meta tags in HTML
    html = html
      .replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`)
      .replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${title}">`)
      .replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:description" content="${description}">`)
      .replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image" content="${ogImageUrl}">`)
      .replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image:secure_url" content="${ogImageUrl}">`)
      .replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:url" content="${canonicalUrl}">`)
      .replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:title" content="${title}">`)
      .replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:description" content="${description}">`)
      .replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:image" content="${ogImageUrl}">`);

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
  } catch (e) {
    // If any error occurs, let default pipeline proceed
    return;
  }
}
