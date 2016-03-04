
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('comic_panels', function (table) {
			table.string('background_image_url');
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('comic_panels', function (table) {
			table.dropColumns(['background_image_url']);
		})
	]);
};
