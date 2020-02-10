#!/usr/bin/env bash
set -e

if [[ ! $(command -v gcloud) ]]; then
    echo 'Installing gcloud sdk'
    sudo apt-get install python
    wget https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-214.0.0-linux-x86_64.tar.gz
    tar xzf google-cloud-sdk-214.0.0-linux-x86_64.tar.gz
    ./google-cloud-sdk/install.sh -q
    sudo cp -R google-cloud-sdk/* /usr/local
fi

echo ${GCLOUD_SERVICE_KEY} | base64 --decode > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
gcloud auth list



gcloud app deploy --project=transactions-api-267820 --quiet
