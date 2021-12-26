FROM node:16.13.0-alpine3.12

# RUN apk add --no-cache tzdata
ENV TZ Europe/Madrid



WORKDIR /usr/src/app
COPY --chown=chrome package.json package-lock.json ./




#RUN set -ex \
#    \
#    && apk add --no-cache chromium \
#    \
#    && mkdir /data \
#    && chown nobody /data



RUN npm install
COPY --chown=chrome . ./
VOLUME /usr/src/app/checkerCrypto


CMD ["./startBot.sh"]

#-----------------
#CREATE VOLUME. CHECK IF IS CREATED FIRST WITH  docker volume ls
#docker volume prune    
#docker volume create mysqlcryptodata

#-----------------
#CREATE NETOWRK. CHECK IF IS CREATED FIRST WITH  docker network ls
#docker network prune    
#docker network create cryptonetwork

#-----------------
#OPEN MYSQL SERVER
#docker run -d -p 33060:3306 --name mysqlcryptoserver -e MYSQL_ROOT_PASSWORD=secret --network cryptonetwork --mount src=mysqlcryptodata,dst=/var/lib/mysql biarms/mysql

#-------------------
#START CRYPTOBOT
#docker buildx build --platform linux/amd64,linux/arm/v7 -t termisfa/cryptobot --push .
#docker pull termisfa/cryptobot
#docker run -d --name cryptobot -v /home/pi/checkerCrypto:/usr/src/app/checkerCrypto --mount src=mysqlcryptodata,dst=/var/lib/mysql --network cryptonetwork termisfa/cryptobot

#-------------------
#TESTS
#docker buildx build --platform linux/amd64,linux/arm/v7 -t termisfa/cryptotest --push .
#docker pull termisfa/cryptotest
#docker run -d --name cryptotest -v C:\Users\Public\checkerCrypto:/usr/src/app/checkerCrypto --mount src=mysqlcryptodata,dst=/var/lib/mysql --network cryptonetwork termisfa/cryptotest

#-------------------
#ENTER MYSQL SHELL
#docker exec -it mysqlcryptoserver mysql -p
