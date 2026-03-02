FROM node:22-bookworm-slim AS builder

WORKDIR /app/Backend

COPY Backend/package*.json ./
RUN npm ci

COPY Backend/ ./
RUN npm run build
RUN mkdir -p dist/templates && cp -r src/templates/* dist/templates/

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app/Backend

COPY Backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/Backend/dist ./dist

EXPOSE 5003

CMD ["npm", "start"]