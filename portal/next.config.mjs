/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // When Next builds on Vercel (VERCEL=1) it injects OpenTelemetry tracing into
  // the Edge runtime bundles. That instrumentation contains `__dirname`, which
  // is undefined in the Edge runtime, so EVERY middleware invocation crashes
  // with `ReferenceError: __dirname is not defined` (MIDDLEWARE_INVOCATION_FAILED).
  // It only happens on Vercel — local `next build` doesn't inject it. Polyfill
  // `__dirname` (and `__filename`) to a harmless value in the Edge bundle.
  webpack: (config, { nextRuntime, webpack }) => {
    if (nextRuntime === 'edge') {
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify('/'),
          __filename: JSON.stringify('/index.js'),
        }),
      );
    }
    return config;
  },
  // The PWA service worker, manifest, and icons are served from /public.
  // The single-file RXaudit HTML is served at /app — see app/app/route.ts.
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
};

export default nextConfig;
