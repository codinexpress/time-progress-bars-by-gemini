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
            const svg = generateSvgOgImage({ item, tab });

            res.setHeader('Content-Type', 'image/svg+xml');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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
        if (!item) return html;

        const formatted = item.charAt(0).toUpperCase() + item.slice(1);
        const title = `${formatted} Progress - Time Flux`;
        const description = `Live real-time progress tracker for ${formatted} on Time Flux.`;
        const ogImage = `/api/og?item=${encodeURIComponent(item)}`;

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
