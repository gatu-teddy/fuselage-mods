import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root. This app lives in a git worktree inside the main Fuselage
  // repo, which has its own lockfile; without this, Turbopack picks the parent repo as
  // root and watches every worktree's files — the dev server then runs out of memory.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
