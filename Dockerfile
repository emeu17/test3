FROM neskoc/pattern:base

WORKDIR api

COPY ./package*.json ./

RUN apt update && apt -y upgrade && apt -y dist-upgrade

RUN npm install

COPY ./ .

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
