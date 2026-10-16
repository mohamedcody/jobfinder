FROM node:24-alpine AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

FROM frontend-deps AS frontend-builder
COPY frontend ./
RUN npm run build

FROM node:24-alpine AS frontend-runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=frontend-builder --chown=node:node /app/frontend/.next/standalone ./
COPY --from=frontend-builder --chown=node:node /app/frontend/.next/static ./.next/static
COPY --from=frontend-builder --chown=node:node /app/frontend/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
