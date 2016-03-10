
exports.up = function(knex, Promise) {
    return Promise.all([
		knex.schema.table('comic_panels', function (table) {
			table.string('title');
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('comic_panels', function (table) {
			table.dropColumns(['title']);
		})
	]);
};
