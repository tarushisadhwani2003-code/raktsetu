# Production image: builds the website, then runs the API server which also serves it.
#   docker build -t raktsetu .
#   docker run -p 5000:5000 -e MONGODB_URI=... -e JWT_SECRET=... raktsetu

# ---- 1. Build the React website ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci
COPY . .
RUN npm run build

# ---- 2. Run the server ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=5000
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev --workspace server && npm cache clean --force
COPY server ./server
COPY shared ./shared
COPY --from=build /app/client/dist ./client/dist
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "server/src/index.js"]
