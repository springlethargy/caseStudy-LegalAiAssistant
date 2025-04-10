/** @type {import('next').NextConfig} */
const nextConfig = {
	// Ensure server-only imports are not bundled on the client
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Don't bundle sqlite3 and typeorm on the client side
			config.resolve.fallback = {
				...config.resolve.fallback,
				typeorm: false,
				sqlite3: false,
			};
		}
		return config;
	},
};

export default nextConfig;
