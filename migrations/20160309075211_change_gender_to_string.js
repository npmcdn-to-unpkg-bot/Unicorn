
exports.up = function(knex, Promise) {
  return Promise.all([
  	knex.schema
  		.raw('ALTER TABLE users DROP COLUMN gender')

  		.table('users', function (table) {
  			table.string('gender');
  		})
  	]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
  	knex.schema
  	  	.raw('ALTER TABLE users DROP COLUMN gender')
  		
  		.table('users', function (table) {
            table.dropColumns('gender');
        })
  	]);
};
