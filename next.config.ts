/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 🔓 LIBERA TUDO (Ótimo para desenvolvimento)
      },
    ],
  },
};

export default nextConfig;