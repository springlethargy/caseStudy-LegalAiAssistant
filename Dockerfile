FROM oven/bun:latest as base

# Set working directory
WORKDIR /app

# Copy environment variables first
COPY .env* ./

# Install dependencies
COPY package.json ./
RUN bun install

# Copy all files
COPY . .

# Build the app
RUN bun run build

# Production image
FROM oven/bun:latest

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy environment variables
COPY .env* ./

# Copy built assets from base
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/next.config.ts ./

# Expose the port
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"] 