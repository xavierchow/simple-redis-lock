#!/bin/sh

docker run --name simple-lock-redis -p 127.0.0.1:6379:6379 -d redis

docker ps

