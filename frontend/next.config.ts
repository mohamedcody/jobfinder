import path from "node:path";
import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// IMPORTANT — Vercel Deployment Note
// ---------------------------------------------------------------------------
// `next.config.ts` rewrites() are resolved at BUILD TIME, not runtime.
// `BACKEND_ORIGIN` **must** be set as a Build Environment Variable in Vercel
// (Settings → Environment Variables → check "Available during Build") in
// addition to being a Runtime variable.
//
// If BACKEND_ORIGIN is missing at build time the rewrite destination will
// fall back to http://localhost:8080, causing ECONNREFUSED in production.
// ---------------------------------------------------------------------------

const backendOrigin = (() => {
  const origin = process.env.BACKEND_ORIGIN;
  if (!origin) {
    // Fail loudly during local development; Vercel will still build but you
    // will see this warning in the build logs.
    console.warn(
      "[next.config] WARNING: BACKEND_ORIGIN is not set. " +
        "API rewrites will point to http://localhost:8080. " +
        "Set BACKEND_ORIGIN as a BUILD environment variable in Vercel.",
    );
    return "http://localhost:8080";
  }
  return origin;
})();

const ngrokDevOrigin = "tetragonally-homotypic-armando.ngrok-free.dev";
const locaUiOrigin = "jobfinder-saad-ui.loca.lt";
const locaApiOrigin = "jobfinder-saad-api.loca.lt";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  poweredByHeader: false,
  allowedDevOrigins: [ngrokDevOrigin, locaUiOrigin, locaApiOrigin, "localhost:3000"],
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendOrigin}/api/auth/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${backendOrigin}/api/users/:path*`,
      },
      {
        source: "/api/jobs/:path*",
        destination: `${backendOrigin}/api/jobs/:path*`,
      },
      {
        source: "/api/saved-jobs/:path*",
        destination: `${backendOrigin}/api/saved-jobs/:path*`,
      },
      {
        source: "/api/cv/:path*",
        destination: `${backendOrigin}/api/cv/:path*`,
      },
      {
        source: "/api/email-alerts/:path*",
        destination: `${backendOrigin}/api/email-alerts/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
