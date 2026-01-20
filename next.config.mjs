/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon-light-32x32.png",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
