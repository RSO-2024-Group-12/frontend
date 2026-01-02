FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build --configuration production


FROM nginx:1.25-alpine

COPY --from=build /app/dist/your-app-name /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
