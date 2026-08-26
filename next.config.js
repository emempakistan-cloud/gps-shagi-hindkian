/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'gpsshagihindkian.vercel.app',
      'wzdhjlgunbcvfnpnhqca.supabase.co',
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'GPS Shagi Hindkian Teacher DATA App',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },
}

module.exports = nextConfig
