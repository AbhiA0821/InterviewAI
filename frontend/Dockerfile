# -----------------------------------------------------------------------
# InterviewAI Frontend Dockerfile
# Multi-stage build: build static assets, then serve with a lightweight
# static file server. (Primary hosting target is Vercel; this Dockerfile
# is provided for local/dev parity and self-hosting scenarios.)
# -----------------------------------------------------------------------

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
