
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
            .raw('ALTER TABLE comic_user DROP CONSTRAINT comic_user_pkey')
            .table('comic_user', function (table) {
                table.uuid('id').notNullable();
                table.primary('id');
                table.unique(['comic_id', 'user_id']);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema
            .raw('ALTER TABLE comic_user DROP CONSTRAINT comic_user_pkey')
            .raw('ALTER TABLE comic_user DROP CONSTRAINT comic_user_comic_id_user_id_unique')
            .table('comic_user', function (table) {
                table.primary(['comic_id', 'user_id']);
                table.dropColumn('id');
        })
    ]);
};
