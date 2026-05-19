import type { NextConfig } from "next";

// FR-006 / SC-005: fully static export — no API routes or server-side data fetching,
// ensuring offline capability after initial load.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
