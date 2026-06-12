import type { NextConfig } from 'next';

const remotePatterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [
  // Covers all standard Cloudflare R2 public bucket URLs
  { protocol: 'https', hostname: '**.r2.dev' },
  { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
];

const r2PublicUrl = process.env.R2_PUBLIC_URL;
if (r2PublicUrl) {
  try {
    const { hostname } = new URL(r2PublicUrl);
    // Avoid duplicate if it's already covered by the wildcard
    if (!hostname.endsWith('.r2.dev')) {
      remotePatterns.push({ protocol: 'https', hostname });
    }
  } catch {
    // Invalid URL in env — skip safely
  }
}

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/r2/image',
      },
    ],
    remotePatterns,
  },
};

export default nextConfig;
