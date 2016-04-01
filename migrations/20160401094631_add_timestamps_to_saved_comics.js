
exports.up = function(knex, Promise) {
  return Promise.all([
  		knex.schema.table('saved_comics', function(table) {
  			table.timestamps();
  		})
  	]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
  		knex.schema.table('saved_comics', function(table) {
  			table.dropColumns(['created_at', 'updated_at']);
  		})
  	]);
};
