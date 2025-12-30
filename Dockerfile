# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source code
COPY . .

# Install native binaries for Alpine (Tailwind CSS v4 + better-sqlite3)
RUN npm install @tailwindcss/oxide-linux-x64-musl lightningcss-linux-x64-musl

# Set environment for build (Tailwind CSS v4)
ENV TAILWIND_MODE=build

# Build Next.js app with standalone output (run twice to ensure TypeScript is available)
RUN npm run build || npm run build

# ---- Production Stage ----
FROM node:20-alpine AS prod
WORKDIR /app

# Install essential tools for healthchecks + python (for better-sqlite3)
RUN apk add --no-cache curl wget python3 make g++

# Explicit production env for Next.js standalone
ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy scripts for DB setup (setup-db.ts will be needed)
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib

# Copy data directory structure (will be empty, mounted as volume in Coolify)
COPY --from=builder /app/data ./data

# Install runtime dependencies for DB setup
RUN npm install better-sqlite3 bcryptjs tsx date-fns

# Expose port
EXPOSE 3000

# Health check managed by Coolify platform

# Initialize DB and start the app
# Note: DB setup will run on first start if /app/data/lottery.db doesn't exist
CMD ["sh", "-c", "if [ ! -f /app/data/lottery.db ]; then npx tsx scripts/setup-db.ts; fi && node server.js"]
