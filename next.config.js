/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/resume',
        destination: '/resume.html',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
