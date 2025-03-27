import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    LLM_URL: process.env.LLM_URL,
    LLM_KEY: process.env.LLM_KEY,
    LLM_NAME: process.env.LLM_NAME,
  },
};

export default nextConfig;
