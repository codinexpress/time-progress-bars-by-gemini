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

  // Only perform HTML rewriting if there is an item parameter or deep link
  if (!item) {
    return;
  }

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
    const ogImageUrl = `${origin}/api/og?item=${encodeURIComponent(item)}`;

    if (UNIT_LABELS[item.toLowerCase()]) {
      const unitName = UNIT_LABELS[item.toLowerCase()];
      title = `${unitName} Progress - Time Flux`;
      description = `Live real-time progress tracker for the current ${unitName.toLowerCase()} on Time Flux.`;
    } else {
      const formatted = item.charAt(0).toUpperCase() + item.slice(1);
      title = `${formatted} Progress - Time Flux`;
      description = `Live real-time progress tracker for ${formatted} on Time Flux.`;
    }

    // Replace meta tags in HTML
    html = html
      .replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`)
      .replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${title}">`)
      .replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:description" content="${description}">`)
      .replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image" content="${ogImageUrl}">`)
      .replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:url" content="${url.href}">`)
      .replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:title" content="${title}">`)
      .replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:description" content="${description}">`)
      .replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:image" content="${ogImageUrl}">`);

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (e) {
    // If any error occurs, let default pipeline proceed
    return;
  }
}
