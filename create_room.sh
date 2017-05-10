#!/bin/bash

# read the options
TEMP=$(getopt -o ":u:h:" --long "user,homeserver:" -- "$@")
eval set -- "$TEMP"

# extract options and their arguments into variables.
while true ; do
    case "$1" in
        -u|--user)
            MX_USER=$2 ; shift 2 ;;
        -h|--homeserver)
            HOMESERVER=$2; shift 2 ;;
        --) shift ; break ;;
    esac
done

if [[ -z $MX_USER ]]; then
    read -p 'Username: ' MX_USER
fi

read -sp 'Password: ' MX_PASSWORD
echo

DATA_BINARY={\"type\":\"m.login.password\",\"user\":\"$MX_USER\",\"password\":\"$MX_PASSWORD\"}

response=$(curl -s $HOMESERVER"/_matrix/client/r0/login" -H 'content-type: application/json' --data-binary $DATA_BINARY)
access_token=$(echo $response  |grep -Po '"access_token": "\K[A-Za-z0-9_-]+')

if [[ -z $access_token ]]; then
    echo $response
    exit 1
fi

DATA_BINARY={\"visibility\":\"public\",\"initial_state\":[{\"type\":\"m.room.guest_access\",\"state_key\":\"\",\"content\":{\"guest_access\":\"can_join\"}},{\"type\":\"m.room.history_visibility\",\"state_key\":\"\",\"content\":{\"history_visibility\":\"world_readable\"}}]}

curl $HOMESERVER"/_matrix/client/r0/createRoom?access_token=$access_token" -H 'content-type: application/json' --data-binary $DATA_BINARY
