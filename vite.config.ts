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
