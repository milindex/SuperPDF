import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  ...(isDev ? {} : { output: "export" as const }),
  // Cloudflare Pages serves the static export from `out/`.
  images: { unoptimized: true },
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  ...(isDev
    ? {
        async headers() {
          return [
            {
              // qpdf-wasm needs cross-origin isolation for SharedArrayBuffer.
              // The static production build sends the same headers from
              // public/_headers on Cloudflare Pages.
              source: "/:path*",
              headers: [
                { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
                {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "require-corp",
                },
              ],
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
