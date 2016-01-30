#!/usr/bin/env bash

#if type psql &>/dev/null; then
#	echo "PostgreSQL is installed!"
#else
#	echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list
#	wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
#fi

if type node &>/dev/null; then
	echo "Node.js is installed!"
else
	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
fi

sudo apt-get update -qq
sudo apt-get install -qq -y nodejs build-essential

cd /vagrant
npm install
