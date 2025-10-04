# -------- Build stage --------
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files (works whether or not you have a lock file)
COPY package*.json ./

# Prefer npm ci if lock exists; else fallback to npm install
# If you do have package-lock.json, keep 'npm ci' only for reproducible builds.
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Copy the app sources
COPY . .

# Build Angular app
# Angular outputs vary by version; the logic below collects the final static files into /out robustly.
RUN npm run build -- --configuration=production && \
    mkdir -p /out && \
    cp -r dist/*/browser/* /out 2>/dev/null || true && \
    if [ -z "$(ls -A /out)" ]; then cp -r dist/*/* /out 2>/dev/null || true; fi && \
    if [ -z "$(ls -A /out)" ]; then cp -r dist/* /out 2>/dev/null || true; fi

# -------- Runtime stage (NGINX) --------
FROM nginx:1.27-alpine AS runtime
RUN rm -f /etc/nginx/conf.d/default.conf
# nginx.conf must sit next to this Dockerfile inside vehicle-lookup-ui/
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /out /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
