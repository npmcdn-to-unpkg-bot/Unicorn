exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function (table) {
            table.uuid('id').primary();
            table.string('username');
            table.string('email');
            table.string('password');
            table.string('name');
            table.timestamps();
        }),

        knex.schema.createTable('comic_user', function (table) {
            table.uuid('user_id')
                .references('id').inTable('users');
            table.uuid('comic_id')
                .references('id').inTable('comics');
            table.boolean('is_owner');
            table.timestamps();
            table.primary(['user_id', 'comic_id']);
        }),

        knex.schema.createTable('comics', function (table) {
            table.uuid('id').primary();
            table.string('title');
            table.timestamps();
        }),

        knex.schema.createTable('comic_panels', function (table) {
            table.uuid('id').primary();
            table.uuid('comic_id')
                .references('id').inTable('comics');
            table.integer('position').unsigned();
            table.timestamps();
        }),

        knex.schema.createTable('speech_bubbles', function (table) {
            table.uuid('id').primary();
            table.uuid('comic_panel_id')
                .references('id').inTable('comic_panels');
            table.text('text');
            table.integer('position_x').unsigned();
            table.integer('position_y').unsigned();
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('speech_bubbles'),
        knex.schema.dropTable('comic_user'),
        knex.schema.dropTable('comic_panels'),
        knex.schema.dropTable('comics'),
        knex.schema.dropTable('users')
    ]);
};
