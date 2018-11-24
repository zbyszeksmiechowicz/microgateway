#!/bin/sh

set echo off

chown apigee:apigee /opt/apigee && \
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
    chown apigee:apigee /tmp/entrypoint.sh