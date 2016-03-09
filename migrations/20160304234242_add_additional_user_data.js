
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('users', function (table) {
            table.string('location');
            table.string('fullname');
            table.smallint('gender');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('users', function (table) {
            table.dropColumns(['location', 'fullname', 'gender']);
        })
    ]);
};
