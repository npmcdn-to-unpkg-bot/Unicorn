
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
            .raw('ALTER TABLE users ALTER COLUMN email SET NOT NULL;')
			.raw('ALTER TABLE users ALTER COLUMN password SET NOT NULL;')
			])
};

exports.down = function(knex, Promise) {
  return Promise.all([
  	knex.schema
  		.raw('ALTER TABLE users ALTER COLUMN email DROP NOT NULL;')
  		.raw('ALTER TABLE users ALTER COLUMN password DROP NOT NULL;')
  		])
};
