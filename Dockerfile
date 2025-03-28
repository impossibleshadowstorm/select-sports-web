FROM node:22.12.0

ADD . /app/

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ENV NODE_PATH /app/node_modules

VOLUME ${NODE_PATH}

COPY package.json /app/package.json
RUN corepack enable
RUN yarn set version stable

RUN yarn install

EXPOSE 3005

CMD ["yarn", "run", "dev"]