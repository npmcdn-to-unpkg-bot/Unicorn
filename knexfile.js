module.exports = {
    development: {
        client: 'pg',
        connection: {
            user: 'unicorn',
            password: 'unicorn',
            database: 'unicorn'
        }
    },

    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL
    }
};
