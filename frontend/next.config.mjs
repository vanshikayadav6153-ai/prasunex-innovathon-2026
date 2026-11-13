/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_EXPORT === "true" || process.env.NETLIFY === "true";

const nextConfig = {
  ...(isExport
    ? { output: "export", images: { unoptimized: true } }
    : {
        async rewrites() {
          return [{ source: "/api/:path*", destination: `${process.env.API_INTERNAL_URL || "http://localhost:8000"}/api/:path*` }];
        },
      }),
};

export default nextConfig;
