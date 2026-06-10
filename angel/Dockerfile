# syntax=docker/dockerfile:1

# ---- Build-Stage: Angular Production-Build ----
FROM node:20-alpine AS build
WORKDIR /app

# Nur Manifeste zuerst (besseres Layer-Caching)
COPY package*.json ./
# --legacy-peer-deps wegen des NgRx/Angular-18-Peer-Konflikts
RUN npm install --legacy-peer-deps

# Restlicher Quellcode (node_modules via .dockerignore ausgeschlossen)
COPY . .
RUN npm run build

# ---- Runtime-Stage: statische Auslieferung über Nginx ----
FROM nginx:1.27-alpine AS runtime

# SPA-Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build-Artefakte aus der Build-Stage (Angular 18: dist/angel/browser)
COPY --from=build /app/dist/angel/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
