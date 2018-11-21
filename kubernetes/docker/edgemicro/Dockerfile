FROM node:8-alpine

# copy entrypoint
COPY entrypoint.sh /tmp

# create user and group for microgateway
RUN apk add --no-cache sed grep && \
    addgroup -S apigee && adduser -s /bin/sh -S -G apigee apigee -h /opt/apigee

WORKDIR /opt/apigee

#install and initialize microgateway
RUN chown apigee:apigee /opt/apigee && \
    npm install --production -g edgemicro && \
    mkdir -p /opt/apigee/logs && \
    chown apigee:apigee /opt/apigee/logs && \
    mkdir -p /opt/apigee/plugins && \
    chown apigee:apigee /opt/apigee/plugins && \
    mkdir /opt/apigee/.edgemicro && \
    chown apigee:apigee /opt/apigee/.edgemicro && \
    ln -s /opt/apigee/.edgemicro /root/.edgemicro && \
    su - apigee -s /bin/sh -c "edgemicro init" && \
    chmod +x /tmp/entrypoint.sh && \
    chwon apigee:apigee /tmp/entrypoint.sh

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
ENTRYPOINT ["/tmp/entrypoint.sh"]
