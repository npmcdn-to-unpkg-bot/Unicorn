
exports.up = function(knex, Promise) {
  return Promise.all([
  		knex.schema.table('saved_comics', function(table) {
  			table.boolean('receive_saved_comic_email').default('false');
  			table.boolean('is_updated');
  		})
  	]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
  		knex.schema.table('saved_comics', function(table) {
  			table.dropColumns(['receive_saved_comic_email', 'is_updated']);
  		})
  	]);
};
