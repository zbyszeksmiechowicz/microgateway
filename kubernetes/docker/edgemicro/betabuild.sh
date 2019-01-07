#!/bin/bash


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ $# -ne 1 ]; then 
	echo "Please provide GCP project id"
        exit 1
fi

project_id=$1

docker build -t edgemicro:beta $DIR -f Dockerfile.beta

if [ $# -eq 2 ]; then
  docker tag edgemicro:$version gcr.io/$project_id/edgemicro:beta
  docker push gcr.io/$project_id/edgemicro:beta
fi
