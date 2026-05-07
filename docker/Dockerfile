FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/
COPY prisma/ ./prisma/

RUN npx prisma generate

RUN npm run build 

#2 Produção

FROM node:20alpine AS production

WORKDIR /app
COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

COPY --from=builder /app/node_module/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY prisma/ ./prisma/

ENV NODE_ENV=productionENV PORT=3333

EXPOSE 3333

CMD ["node", "dist/server.js"]