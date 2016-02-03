#!/usr/bin/env bash

# Fixes a locale error
# http://askubuntu.com/a/227513
sudo locale-gen "en_CA.UTF-8"

if type psql &>/dev/null; then
	echo "PostgreSQL is installed!"
else
	echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list
	wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    sudo apt-get update -qq
	apt-get install -qq postgresql-9.5

	# Based on: https://github.com/laravel/settler/blob/master/scripts/provision.sh#L203
    sudo -u postgres psql -c "CREATE ROLE unicorn LOGIN UNENCRYPTED PASSWORD 'unicorn' SUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;"
    sudo -u postgres /usr/bin/createdb --echo --owner=unicorn unicorn
fi

if type node &>/dev/null; then
	echo "Node.js is installed!"
else
	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
fi

sudo apt-get update -qq
sudo apt-get install -qq -y nodejs build-essential postgresql-9.5

sudo npm -g install knex

cd /vagrant
npm install
