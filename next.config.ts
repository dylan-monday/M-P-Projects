import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project so it doesn't pick up
  // a stray package-lock.json from a parent directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
