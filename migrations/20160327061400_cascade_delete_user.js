exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .raw('ALTER TABLE comic_user DROP CONSTRAINT comic_user_user_id_foreign'),
    knex.schema
      .raw('ALTER TABLE comic_user ADD CONSTRAINT comic_user_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE'),
    knex.schema
      .raw('ALTER TABLE saved_comics DROP CONSTRAINT saved_comics_user_id_foreign'),
    knex.schema
      .raw('ALTER TABLE saved_comics ADD CONSTRAINT saved_comics_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE')
	]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .raw('ALTER TABLE comic_user DROP CONSTRAINT comic_user_user_id_foreign'),
    knex.schema
      .raw('ALTER TABLE comic_user ADD CONSTRAINT comic_user_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id)'),
    knex.schema
      .raw('ALTER TABLE saved_comics DROP CONSTRAINT saved_comics_user_id_foreign'),
    knex.schema
      .raw('ALTER TABLE saved_comics ADD CONSTRAINT saved_comics_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id)')
	]);
};