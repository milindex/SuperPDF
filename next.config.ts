import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  async headers() {
    return [
      {
        // qpdf-wasm needs cross-origin isolation for SharedArrayBuffer. Only
        // the tools that load the engine require these headers, but they are
        // safe site-wide on this same-origin app.
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;