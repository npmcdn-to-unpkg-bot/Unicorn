'use strict';
var objection_1 = require('objection');
var Comic_1 = require('./Comic');
var BaseModel_1 = require('./BaseModel');
class User extends BaseModel_1.BaseModel {
    static get tableName() {
        return 'users';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'username', 'created_at', 'updated_at'],
            properties: {
                id: { type: 'string', minLength: 36, maxLength: 36 },
                username: { type: 'string', maxLength: 255 }
            }
        };
    }
    static get relationMappings() {
        return {
            comics: {
                relation: objection_1.ManyToManyRelation,
                modelClass: Comic_1.Comic,
                join: {
                    from: 'users.id',
                    to: 'comics.id',
                    through: {
                        from: 'comic_user.user_id',
                        to: 'comic_user.comic_id'
                    }
                }
            }
        };
    }
}
exports.User = User;
