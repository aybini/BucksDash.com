/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://apis.google.com https://www.gstatic.com https://accounts.google.com https://firebase.googleapis.com https://www.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://m.stripe.network; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com https://*.firebaseapp.com; connect-src 'self' https://api.stripe.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://*.googleapis.com https://apis.google.com; img-src 'self' data: https://*.stripe.com;"
          },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;