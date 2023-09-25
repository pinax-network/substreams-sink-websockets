FROM oven/bun

WORKDIR /app

EXPOSE 3000

ENV PUBLIC_KEY $PUBLIC_KEY
ENV PORT $PORT

COPY bun.lockb ./
COPY package*.json ./

RUN bun install

COPY . .

CMD [ "bun", "http.ts" ]