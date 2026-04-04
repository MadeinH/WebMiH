/* Next.js Configuration — Security Hardened (converted from TS to ESM JavaScript) */
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = process.env.NODE_ENV !== 'production'

// Next.js dev server necesita eval/inline para React Refresh y runtime de HMR.
// En producción App Router también inyecta scripts inline para hydration/Flight.
// Sin nonce por request, la alternativa pragmática es permitir unsafe-inline.
const ContentSecurityPolicy = isDev
  ? `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://checkout.wompi.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' ws: wss: http: https: https://*.supabase.co https://www.google.com https://api.wompi.co https://checkout.wompi.co;
  frame-src https://www.google.com https://checkout.wompi.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://checkout.wompi.co;
  frame-ancestors 'none';
`
  : `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://checkout.wompi.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://www.google.com https://api.wompi.co https://checkout.wompi.co;
  frame-src https://www.google.com https://checkout.wompi.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://checkout.wompi.co;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.join(__dirname, '..', '..'),

  images: {
    formats: ['image/avif', 'image/webp'],
    // Calidades permitidas para `next/image` — incluye 82 usado en banners
    qualities: [75, 82, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.net',
      },
    ],
    // Disable Next.js built-in image optimization to reduce CPU on serverless builds
    // Images are served as-is (use CDN or Supabase public URLs).
    unoptimized: true,
  },

  experimental: {
    optimizePackageImports: ['zod', '@supabase/supabase-js'],
  },

  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/favicon.ico',
        destination: '/logo.png',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default nextConfig
