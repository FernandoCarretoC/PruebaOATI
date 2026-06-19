# Stage 1: build Angular app
FROM node:20-alpine AS build

ARG API_URL=https://pruebaoati-backend.onrender.com/api

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts
RUN npm run build -- --configuration=production

# Stage 2: Nginx con proxy (solo Docker Compose local)
FROM nginx:alpine AS local

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Nginx solo SPA (Render / producción) — stage por defecto
FROM nginx:alpine AS production

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
