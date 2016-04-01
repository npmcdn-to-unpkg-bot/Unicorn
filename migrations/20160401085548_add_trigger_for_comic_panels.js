
exports.up = function(knex, Promise) {
  return Promise.all([
      knex.schema
          .raw('CREATE FUNCTION comic_panel_trigger() RETURNS trigger AS $comic_panel_trigger$ BEGIN UPDATE saved_comics SET is_updated = true WHERE comic_id=NEW.comic_id; RETURN NEW; END; $comic_panel_trigger$ LANGUAGE plpgsql;')
          .raw('CREATE TRIGGER comic_panel_trigger AFTER INSERT OR UPDATE ON comic_panels FOR EACH ROW EXECUTE PROCEDURE comic_panel_trigger();')

          .raw('CREATE FUNCTION comic_panel_delete_trigger() RETURNS trigger AS $comic_panel_delete_trigger$ BEGIN UPDATE saved_comics SET is_updated = true WHERE comic_id=OLD.comic_id; RETURN OLD; END; $comic_panel_delete_trigger$ LANGUAGE plpgsql;')
          .raw('CREATE TRIGGER comic_panel_delete_trigger AFTER DELETE ON comic_panels FOR EACH ROW EXECUTE PROCEDURE comic_panel_delete_trigger();')
    ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
      knex.schema
          .raw('DROP TRIGGER comic_panel_trigger ON comic_panels')
          .raw('DROP TRIGGER comic_panel_delete_trigger ON comic_panels')
          .raw('DROP FUNCTION comic_panel_trigger()')
          .raw('DROP FUNCTION comic_panel_delete_trigger()')

    ]);
};
