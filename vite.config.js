import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Replaces the dev-friendly CSP meta tag in index.html with a strict one
 * during production builds. The dev version has 'unsafe-inline' and
 * 'unsafe-eval' for Vite HMR; prod doesn't need either (the bundle is
 * pre-compiled, no inline scripts, no eval). We also collapse
 * connect-src to the actual VITE_API_URL origin so the prod SPA can't
 * be tricked into talking to a different backend by a malicious cache
 * intermediary or extension.
 *
 * Production deployments behind nginx / a CDN should *also* set this
 * via HTTP headers — meta CSP can't carry frame-ancestors. The plugin
 * is a defense-in-depth fallback when the host doesn't.
 */
function strictProductionCsp(env) {
  return {
    name: 'strict-production-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const apiUrl = (env.VITE_API_URL || '').trim();
      const apiOrigin = apiUrl ? new URL(apiUrl).origin : '';
      const directives = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'", // Tailwind ships some inline style attributes
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        `connect-src 'self'${apiOrigin ? ' ' + apiOrigin : ''}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');

      // Replace whatever CSP meta is in index.html with the strict version.
      return html.replace(
        /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i,
        `<meta http-equiv="Content-Security-Policy" content="${directives}" />`,
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react(), strictProductionCsp(env)],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'query-vendor': ['@tanstack/react-query'],
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
  };
});
