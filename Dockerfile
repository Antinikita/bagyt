# Multi-stage build for the Vite SPA.
#
# The CSP plugin in vite.config.js bakes VITE_API_URL into the final
# bundle's <meta> tag at build time (line 22-34) — that's why the API
# URL must be a build-arg, not a runtime env var. Each environment
# (preview / prod) needs its own image build with the right URL.

# ---- Stage 1: build ----
# Base images pinned to digests — a hijacked tag can't silently push
# malicious code into our prod image. Bump deliberately.
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS build

WORKDIR /app

# Cache deps independently from source — `npm ci` is the slow step.
COPY package.json package-lock.json ./
RUN npm ci

# Vite inlines anything matching VITE_* into the bundle at build time.
ARG VITE_API_URL=http://localhost:8000
ARG VITE_SENTRY_DSN=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

COPY . .
RUN npm run build

# ---- Stage 2: serve ----
FROM nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10 AS serve

# Static files only — no node, no build chain in the runtime image.
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# nginx default CMD ("nginx -g 'daemon off;'") is fine for us.
