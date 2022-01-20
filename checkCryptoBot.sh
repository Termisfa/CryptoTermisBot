#!/bin/sh

NUMERO=$(($1-1))

if [ $NUMERO -lt 0 ]
 then
 NUMERO=$(($NUMERO+24));
fi



FILE=/home/pi/checkerCrypto/$NUMERO
if test ! -f "$FILE"; then
    docker stop cryptobot;
    docker start cryptobot;
fi

