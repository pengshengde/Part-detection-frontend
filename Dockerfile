FROM  node:lts as builder

 # env set
ENV EVA_ENTRYPOINT=/api

ADD package.json /
WORKDIR /

#RUN npm install --registry=https://registry.npm.taobao.org
RUN npm install

ADD / /vue
WORKDIR /vue


RUN npm run build:prod

FROM nginx:alpine

LABEL maintainer="peng"

COPY --from=builder /vue/dist/ /home/peng/frontend/dist/

EXPOSE 80
