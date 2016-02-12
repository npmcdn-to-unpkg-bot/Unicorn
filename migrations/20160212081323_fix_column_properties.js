
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
            .raw('ALTER TABLE comic_user ALTER COLUMN is_owner SET DEFAULT false;')
            .raw('ALTER TABLE comic_user ALTER COLUMN is_owner SET NOT NULL;')
            .raw('ALTER TABLE comic_user ALTER COLUMN created_at SET NOT NULL;')
            .raw('ALTER TABLE comic_user ALTER COLUMN updated_at SET NOT NULL;')

            .raw('ALTER TABLE comics ALTER COLUMN title SET NOT NULL;')
            .raw("UPDATE comics SET created_at = '2015-01-01' WHERE created_at IS NULL;")
            .raw("UPDATE comics SET updated_at = '2015-01-01' WHERE updated_at IS NULL;")
            .raw('ALTER TABLE comics ALTER COLUMN created_at SET NOT NULL;')
            .raw('ALTER TABLE comics ALTER COLUMN updated_at SET NOT NULL;')

            .raw('ALTER TABLE users ALTER COLUMN username SET NOT NULL;')
            .raw("UPDATE users SET created_at = '2015-01-01' WHERE created_at IS NULL;")
            .raw("UPDATE users SET updated_at = '2015-01-01' WHERE updated_at IS NULL;")
            .raw('ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;')
            .raw('ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;')

            .raw('ALTER TABLE comic_panels ALTER COLUMN comic_id SET NOT NULL;')
            .raw('ALTER TABLE comic_panels ALTER COLUMN position SET NOT NULL;')
            .raw('ALTER TABLE comic_panels ALTER COLUMN created_at SET NOT NULL;')
            .raw('ALTER TABLE comic_panels ALTER COLUMN updated_at SET NOT NULL;')

            .raw('ALTER TABLE speech_bubbles ALTER COLUMN comic_panel_id SET NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN text SET NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN position_x SET NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN position_y SET NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN created_at SET NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN updated_at SET NOT NULL;')

            .table('comic_panels', function (table) {
                table.unique(['comic_id', 'position']);
            })

            .table('comic_user', function (table) {
                table.index('is_owner');
            })

            .table('users', function (table) {
                table.unique('username');
                table.unique('email');
            })

            .table('speech_bubbles', function (table) {
                table.index('comic_panel_id');
            })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema
            .raw('ALTER TABLE comic_user ALTER COLUMN is_owner SET DEFAULT NULL;')
            .raw('ALTER TABLE comic_user ALTER COLUMN is_owner DROP NOT NULL;')

            .raw('ALTER TABLE comics ALTER COLUMN title DROP NOT NULL;')
            .raw('ALTER TABLE comics ALTER COLUMN created_at DROP NOT NULL;')
            .raw('ALTER TABLE comics ALTER COLUMN updated_at DROP NOT NULL;')

            .raw('ALTER TABLE users ALTER COLUMN username DROP NOT NULL;')
            .raw('ALTER TABLE users ALTER COLUMN created_at DROP NOT NULL;')
            .raw('ALTER TABLE users ALTER COLUMN updated_at DROP NOT NULL;')

            .raw('ALTER TABLE comic_panels ALTER COLUMN comic_id DROP NOT NULL;')
            .raw('ALTER TABLE comic_panels ALTER COLUMN position DROP NOT NULL;')
            .raw('ALTER TABLE comic_panels ALTER COLUMN created_at DROP NOT NULL;')
            .raw('ALTER TABLE comic_panels ALTER COLUMN updated_at DROP NOT NULL;')
            .raw('ALTER TABLE comic_panels DROP CONSTRAINT comic_panels_comic_id_position_unique;')

            .raw('ALTER TABLE speech_bubbles ALTER COLUMN comic_panel_id DROP NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN text DROP NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN position_x DROP NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN position_y DROP NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN created_at DROP NOT NULL;')
            .raw('ALTER TABLE speech_bubbles ALTER COLUMN updated_at DROP NOT NULL;')

            .raw('ALTER TABLE users DROP CONSTRAINT users_username_unique;')
            .raw('ALTER TABLE users DROP CONSTRAINT users_email_unique;')

            .table('comic_user', function (table) {
                table.dropIndex(null, 'comic_user_is_owner_index');
            })

            .table('speech_bubbles', function (table) {
                table.dropIndex(null, 'speech_bubbles_comic_panel_id_index');
            })
    ]);
};
