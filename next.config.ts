import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		LLM_URL: process.env.LLM_URL,
		LLM_KEY: process.env.LLM_KEY,
		LLM_NAME: process.env.LLM_NAME,
		DB_URL: process.env.DB_URL,
	},
	// Ensure server-only imports are not bundled on the client
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Don't bundle server-side packages on the client side
			config.resolve.fallback = {
				...config.resolve.fallback,
			};
		}
		return config;
	},
};

export default nextConfig;
