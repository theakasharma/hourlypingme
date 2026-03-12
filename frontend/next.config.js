/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In Docker/Coolify, BACKEND_URL must be set to the internal backend service URL
    // e.g. http://crm-backend:5000  or  http://<coolify-internal-hostname>:5000
    // Falls back to localhost:5000 for local development
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const backendUrl = "http://lkogoos4ow4w4kgsos0k0wc4.46.202.163.134.sslip.io" || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  output: 'standalone', // Required for Docker / Coolify deployment
};

module.exports = nextConfig;
