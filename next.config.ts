import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		LLM_URL: process.env.LLM_URL,
		LLM_KEY: process.env.LLM_KEY,
		LLM_NAME: process.env.LLM_NAME,
		DB_URL: process.env.DB_URL,
	},
	// Configuration for both webpack and turbo
	experimental: {
		turbo: {},
	},
	// Common configuration for both bundlers
	// For webpack in production and turbo in development
	eslint: {
		ignoreDuringBuilds: true,
	},
	// Make both bundlers use the same configuration for externals if needed
	transpilePackages: [],
	devIndicators: false
};

export default nextConfig;
