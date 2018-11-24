FROM node:8-alpine

COPY install.sh /tmp

# create user and group for microgateway
RUN apk add --no-cache sed grep && \
    addgroup -S apigee && \
    adduser -s /bin/sh -S -G apigee apigee -h /opt/apigee

WORKDIR /opt/apigee

# copy entrypoint
COPY entrypoint.sh /opt/apigee

#install and initialize microgateway
RUN chmod +x /tmp/install.sh && \
    sh /tmp/install.sh && \
    rm -f /tmp/install.sh

VOLUME /opt/apigee/.edgemicro
VOLUME /opt/apigee/logs
VOLUME /opt/apigee/plugins

# copy tls files if needed
# COPY key.pem /opt/apigee/.edgemicro
# COPY cert.pem /opt/apigee/.edgemicro

# Expose ports
EXPOSE 8000
EXPOSE 8443
USER apigee
ENTRYPOINT ["entrypoint"]
