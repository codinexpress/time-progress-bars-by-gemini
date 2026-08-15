import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateSvgOgImage } from './utils/svgOgGenerator';

function ogDevPlugin(): Plugin {
  return {
    name: 'og-dev-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/og')) {
          try {
            const parsedUrl = new URL(url, 'http://localhost:3000');
            const item = parsedUrl.searchParams.get('item') || parsedUrl.searchParams.get('unit');
            const tab = parsedUrl.searchParams.get('tab');
            const tz = parsedUrl.searchParams.get('tz') || parsedUrl.searchParams.get('offset');
            const t = parsedUrl.searchParams.get('t') || parsedUrl.searchParams.get('ts') || parsedUrl.searchParams.get('time');
            const v = parsedUrl.searchParams.get('v') || parsedUrl.searchParams.get('nonce');
            const svg = generateSvgOgImage({ item, tab, tz, t, v });

            res.setHeader('Content-Type', 'image/svg+xml');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.statusCode = 200;
            res.end(svg);
            return;
          } catch (e: any) {
            res.statusCode = 500;
            res.end(`Error generating OG image: ${e?.message}`);
            return;
          }
        }
        next();
      });
    },
    transformIndexHtml(html, ctx) {
      if (!ctx || !ctx.originalUrl) return html;
      try {
        const parsedUrl = new URL(ctx.originalUrl, 'http://localhost:3000');
        const item = parsedUrl.searchParams.get('item') || parsedUrl.searchParams.get('unit');
        const tz = parsedUrl.searchParams.get('tz') || parsedUrl.searchParams.get('offset');
        const t = parsedUrl.searchParams.get('t') || parsedUrl.searchParams.get('ts') || parsedUrl.searchParams.get('time') || String(Date.now());
        const v = parsedUrl.searchParams.get('v') || parsedUrl.searchParams.get('nonce');
        const tab = parsedUrl.searchParams.get('tab');

        const ogParams = new URLSearchParams();
        if (item) ogParams.set('item', item);
        if (tab) ogParams.set('tab', tab);
        if (tz) ogParams.set('tz', tz);
        if (t) ogParams.set('t', t);
        if (v) ogParams.set('v', v);

        const ogParamString = ogParams.toString();
        const ogImage = `/api/og${ogParamString ? `?${ogParamString}` : ''}`;

        let title = 'Time Flux - Real-Time Existence Tracker';
        let description = 'Visualize the flow of existence across second, minute, hour, day, week, month, year, decade, and century with live progress bars.';

        if (item) {
          const formatted = item.charAt(0).toUpperCase() + item.slice(1);
          title = `${formatted} Progress - Time Flux`;
          description = `Live real-time progress tracker for ${formatted} on Time Flux.`;
        }

        return html
          .replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`)
          .replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${title}">`)
          .replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:description" content="${description}">`)
          .replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image" content="${ogImage}">`)
          .replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:title" content="${title}">`)
          .replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:description" content="${description}">`)
          .replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:image" content="${ogImage}">`);
      } catch (e) {
        return html;
      }
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), ogDevPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
