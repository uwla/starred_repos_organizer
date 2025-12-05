FROM node:24

# environment variables
ENV DEBIAN_FRONTEND=noninteractive

# install git and curl
RUN apt-get update \
    && apt-get install -y curl git ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# copy application
COPY . /home/node/app

# create directory to run the app
RUN chown -R node:node /home/node/app

# switch user to dev
USER node

# switch working directory to app
WORKDIR /home/node/app

# install dependencies
RUN rm -rf package-lock.json node_modules && npm install

# expose the port the api is running
EXPOSE 3000

# expose the port the app is running
EXPOSE 5173

# default command for the container to run
CMD ["npm", "run", "dev:rest"]
