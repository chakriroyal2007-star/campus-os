/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/faculty',
        destination: '/teacher/dashboard',
        permanent: false,
      },
      {
        source: '/teacher',
        destination: '/teacher/dashboard',
        permanent: false,
      },
      {
        source: '/student',
        destination: '/student/dashboard',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    if (process.env.BACKEND_URL) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${process.env.BACKEND_URL}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
