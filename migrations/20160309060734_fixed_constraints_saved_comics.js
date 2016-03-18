 
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema
			.raw('ALTER TABLE saved_comics DROP CONSTRAINT saved_comics_pkey')
		]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema
			.raw('ALTER TABLE saved_comics ADD PRIMARY KEY (user_id)')
	]);
};
