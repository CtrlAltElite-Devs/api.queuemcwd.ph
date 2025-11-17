#!/bin/sh

# wait for MySQL
/usr/src/app/wait-for.sh mysql:3306 -t 90 -- echo "MySQL ready"

# wait for Redis
/usr/src/app/wait-for.sh redis:6379 -t 30 -- echo "Redis ready"

# start production app
node dist/src/main.js
