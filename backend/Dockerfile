FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

CMD sh -c "npm run build && npx drizzle-kit push --force && (npm run db:seed || true) && npm run start:prod"
