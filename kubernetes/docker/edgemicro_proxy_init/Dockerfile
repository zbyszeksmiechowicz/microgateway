FROM gliderlabs/alpine:3.4

RUN apk add --no-cache curl bash iptables && \ 
    rm -rf /var/lib/apt/lists/* 

COPY prepare_proxy.sh /tmp/
RUN chmod +x /tmp/prepare_proxy.sh
ENTRYPOINT ["/tmp/prepare_proxy.sh"]