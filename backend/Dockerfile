# ── Fase de build ─────────────────────────────────────────────────────────────
# Usa Debian (glibc) para compilar bindings nativos do better-sqlite3,
# garantindo compatibilidade com o runtime distroless (também glibc).
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Dependências de compilação nativa (better-sqlite3 usa node-gyp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts=false

COPY src ./src

# ── Runtime: distroless (sem shell, sem pacotes, superfície mínima) ───────────
# UID não-root 65532 (nonroot) embutido na imagem distroless
FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json ./

USER nonroot
EXPOSE 3000

# Healthcheck via script Node.js (sem wget/curl no distroless)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "src/healthcheck.js"]

CMD ["src/server.js"]
