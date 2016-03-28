exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .raw('ALTER TABLE comic_panels DROP CONSTRAINT comic_panels_comic_id_foreign'),
    knex.schema
      .raw('ALTER TABLE comic_panels ADD CONSTRAINT comic_panels_comic_id_foreign FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE'),
    knex.schema
      .raw('ALTER TABLE speech_bubbles DROP CONSTRAINT speech_bubbles_comic_panel_id_foreign'),
    knex.schema
      .raw('ALTER TABLE speech_bubbles ADD CONSTRAINT speech_bubbles_comic_panel_id_foreign FOREIGN KEY (comic_panel_id) REFERENCES comic_panels (id) ON DELETE CASCADE'),
    knex.schema
      .raw('ALTER TABLE comic_user DROP CONSTRAINT comic_user_comic_id_foreign'),
    knex.schema
      .raw('ALTER TABLE comic_user ADD CONSTRAINT comic_user_comic_id_foreign FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE'),
    knex.schema
      .raw('ALTER TABLE saved_comics DROP CONSTRAINT saved_comics_comic_id_foreign'),
    knex.schema
      .raw('ALTER TABLE saved_comics ADD CONSTRAINT saved_comics_comic_id_foreign FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE')
	]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .raw('ALTER TABLE comic_panels DROP CONSTRAINT comic_panels_comic_id_foreign'),
    knex.schema
      .raw('ALTER TABLE comic_panels ADD CONSTRAINT comic_panels_comic_id_foreign FOREIGN KEY (comic_id) REFERENCES comics (id)'),
    knex.schema
      .raw('ALTER TABLE speech_bubbles DROP CONSTRAINT speech_bubbles_comic_panel_id_foreign'),
    knex.schema
      .raw('ALTER TABLE speech_bubbles ADD CONSTRAINT speech_bubbles_comic_panel_id_foreign FOREIGN KEY (comic_panel_id) REFERENCES comic_panels (id)'),
    knex.schema
      .raw('ALTER TABLE comic_user DROP CONSTRAINT comic_user_comic_id_foreign'),
    knex.schema
      .raw('ALTER TABLE comic_user ADD CONSTRAINT comic_user_comic_id_foreign FOREIGN KEY (comic_id) REFERENCES comics (id)'),
    knex.schema
      .raw('ALTER TABLE saved_comics DROP CONSTRAINT saved_comics_comic_id_foreign'),
    knex.schema
      .raw('ALTER TABLE saved_comics ADD CONSTRAINT saved_comics_comic_id_foreign FOREIGN KEY (comic_id) REFERENCES comics (id)')
	]);
};
