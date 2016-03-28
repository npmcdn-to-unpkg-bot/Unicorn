
exports.up = function(knex, Promise) {
  return Promise.all([
  	knex.schema.createTable('saved_comics' , function (table) {
  		table.uuid('user_id')
  			.references('id').inTable('users');
  		table.uuid('comic_id')
  			.references('id').inTable('comics');
  		table.primary(['user_id', 'comic_id']);
  	})
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
  	knex.schema.dropTable('saved_comics')
  ]);
};
