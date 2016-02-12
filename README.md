Collaborative Comic Strips :: Unicorn Edition!
==============================================

[Link to the production site](http://ubc-unicorn.deltchev.com/)

Setting up a dev environment
----------------------------

1. Install [Vagrant](https://vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/).
2. `vagrant-plugin install vagrant-hostmanager`
3. Clone this repo.
4. Run `vagrant up` in the repo root.
5. `vagrant ssh`, then `cd vagrant` and `npm start`.

You'll then be able to access the app at [unicorn.comics:3000](http://unicorn.comics:3000/)!


Accessing the database
----------------------

To access the database, SSH into the Vagrant box and run `sudo -u postgres psql unicorn`.
You'll then be connected to the project's database with the [Postgres CLI](http://www.postgresql.org/docs/9.5/static/app-psql.html).
