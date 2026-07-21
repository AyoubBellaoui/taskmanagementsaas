import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project — without it, Next.js/Turbopack
  // finds a stray lockfile further up the filesystem and misdetects the
  // monorepo root, which prints a (harmless but noisy) warning on every build.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
