FROM node:24.21-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS dev
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "pnpm prisma generate && pnpm dev"]

FROM deps AS build
ARG DATABASE_URL="postgresql://user:password@localhost:5432/tickets"
COPY tsconfig.json tsup.config.ts prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN DATABASE_URL="$DATABASE_URL" pnpm prisma generate \
    && pnpm build

FROM deps AS migrate
COPY prisma.config.ts ./
COPY prisma ./prisma
CMD ["pnpm", "prisma", "migrate", "deploy"]

FROM base AS prod
ENV NODE_ENV=production \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile \
    && rm -rf "$(pnpm store path)" /root/.cache/pnpm /root/.cache/node \
    && find node_modules/.pnpm -type f -name 'query_compiler_*' ! -name '*postgresql*' -delete \
    && find node_modules/.pnpm -type f -name 'wasm-compiler-edge*' -delete \
    && find node_modules/.pnpm -type f -name '*.map' -delete \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
        /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
        /usr/local/bin/pnpm /usr/local/bin/pnpx
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider "http://127.0.0.1:${PORT:-3000}/api/v1/holamundo" || exit 1
CMD ["node", "dist/server.js"]
