#!/bin/sh

# Log Location on Server.
LOG_LOCATION=/opt/apigee/logs
#exec > >(tee -i $LOG_LOCATION/edgemicro.log)
exec 2>&1 | tee -a $LOG_LOCATION/edgemicro.log
echo "Log Location: [ $LOG_LOCATION ]"

if [[ $SERVICE_NAME == "" ]]
  then
  SERVICE_NAME=$(env | grep POD_NAME=| cut -d '=' -f2| cut -d '-' -f1 | tr '[a-z]' '[A-Z]')
fi

if [[ -n "$CONTAINER_PORT"  ]]
    then
    SERVICE_PORT=$CONTAINER_PORT
elif [[ -n "$SERVICE_NAME_SERVICE_PORT_HTTP"  ]]
  then
  ## We should create a Service name label if the deployment name is not same as service name
  ## In most of the cases it will work. The workaround is to add a containerPort label
  SERVICE_PORT=$(env | grep $SERVICE_NAME_SERVICE_PORT_HTTP=| cut -d '=' -f 2)
fi

if [[ -n "$EDGEMICRO_API_BASEPATH" ]]
  then
  BASE_PATH=$EDGEMICRO_API_BASEPATH
else
  BASE_PATH="/"
fi

if [[ -n "$EDGEMICRO_API_REVISION" ]]
  then
  REVISION=$EDGEMICRO_API_REVISION
else
  REVISION="1"
fi

PROXY_NAME=edgemicro_$SERVICE_NAME
TARGET_PORT=$SERVICE_PORT
PLUGIN_DIR="/opt/apigee/plugins"
BACKGROUND=" &"
MGSTART=" edgemicro start -o $EDGEMICRO_ORG -e $EDGEMICRO_ENV -k $EDGEMICRO_KEY -s $EDGEMICRO_SECRET -d $PLUGIN_DIR "
LOCALPROXY=" export EDGEMICRO_LOCAL_PROXY=$EDGEMICRO_LOCAL_PROXY "
MGDIR="cd /opt/apigee "
DECORATOR=" export EDGEMICRO_DECORATOR=$EDGEMICRO_DECORATOR "
DEBUG=" export DEBUG=$DEBUG "
REDIRECT=" 2>&1 | tee -a $LOG_LOCATION/edgemicro.log"

if [[ -n "$EDGEMICRO_CONFIG"  ]]
  then
  echo $EDGEMICRO_CONFIG | base64 -d > /opt/apigee/.edgemicro/$EDGEMICRO_ORG-$EDGEMICRO_ENV-config.yaml
  chown apigee:apigee /opt/apigee/.edgemicro/*
fi

#Always override the port with 8000 for now.
sed -i.back "s/port.*/port: 8000/g" /opt/apigee/.edgemicro/$EDGEMICRO_ORG-$EDGEMICRO_ENV-config.yaml

if [[ -n "$EDGEMICRO_OVERRIDE_edgemicro_config_change_poll_interval" ]]; then
  sed -i.back "s/config_change_poll_interval.*/config_change_poll_interval: $EDGEMICRO_OVERRIDE_edgemicro_config_change_poll_interval/g" /opt/apigee/.edgemicro/$EDGEMICRO_ORG-$EDGEMICRO_ENV-config.yaml
fi

# set the number of microgateway processes
if [[ -n "$EDGEMICRO_PROCESSES" ]]
  then
  MGSTART=" edgemicro start -o $EDGEMICRO_ORG -e $EDGEMICRO_ENV -k $EDGEMICRO_KEY -s $EDGEMICRO_SECRET -p $EDGEMICRO_PROCESSES -d $PLUGIN_DIR "
fi

# allow for custom CA certs, including self signed certs
if [[ -n "$NODE_EXTRA_CA_CERTS" ]]
  then
  MGSTART=" export NODE_EXTRA_CA_CERTS="$NODE_EXTRA_CA_CERTS " && "$MGSTART
fi  

if [[ -n "$EDGEMICRO_LOCAL_PROXY" ]]
  then
  DECORATOR=" export EDGEMICRO_DECORATOR=1 "
  CMDSTRING="$MGDIR && $DECORATOR &&  $LOCALPROXY && $MGSTART -a $PROXY_NAME -v $REVISION -b $BASE_PATH -t http://localhost:$TARGET_PORT $REDIRECT $BACKGROUND"
else
  CMDSTRING="$MGDIR && $MGSTART $REDIRECT $BACKGROUND"
fi

if [[ -n "$DEBUG" ]]
  then
  /bin/sh -c "$DEBUG && $CMDSTRING"
else
  /bin/sh -c "$CMDSTRING"
fi

# SIGUSR1-handler
my_handler() {
  echo "my_handler" >> /tmp/entrypoint.log
  /bin/sh -c "cd /opt/apigee && edgemicro stop"
}

# SIGTERM-handler
term_handler() {
  echo "term_handler" >> /tmp/entrypoint.log
  /bin/sh -c "cd /opt/apigee && edgemicro stop"
  exit 143; # 128 + 15 -- SIGTERM
}

# setup handlers
# on callback, kill the last background process, which is `tail -f /dev/null` and execute the specified handler
trap 'kill ${!}; my_handler' SIGUSR1
trap 'kill ${!}; term_handler' SIGTERM

while true
do
  tail -f /dev/null & wait ${!}
done