# Set the base image to Ubuntu
FROM ubuntu:14.04

# Expose Redis port 6379
EXPOSE  6379

# xdv
RUN sed -i -e 's/101)/102)/g' /usr/sbin/invoke-rc.d

# Install Node.js and other dependencies
RUN ["/bin/bash", "-c", "apt-get update && apt-get -y install curl && curl -sL https://deb.nodesource.com/setup | sudo bash - && apt-get -y install python build-essential nodejs redis-server"]

# Install express
RUN npm install express

# Install redis
RUN npm install redis --save

# Install socketio
RUN npm install socket.io

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

# Expose port
EXPOSE  8080

#bind redis
RUN sed -i -e 's/bind 127.0.0.1/bind 0.0.0.0/g' /etc/redis/redis.conf
RUN service redis-server restart

# Run app using nodemon
RUN echo $HOME

# Run app using nodemon
CMD ["nodejs", "/src/app.js"]