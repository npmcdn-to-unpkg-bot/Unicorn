'use strict';
var objection_1 = require('objection');
var User_1 = require('./User');
var ComicPanel_1 = require('./ComicPanel');
var BaseModel_1 = require('./BaseModel');
class Comic extends BaseModel_1.BaseModel {
    static get tableName() {
        return 'comics';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'title', 'created_at', 'updated_at'],
            properties: {
                id: { type: 'string', minLength: 36, maxLength: 36 },
                title: { type: 'string', maxLength: 255 }
            }
        };
    }
    static get relationMappings() {
        return {
            users: {
                relation: objection_1.ManyToManyRelation,
                modelClass: User_1.User,
                join: {
                    from: 'comics.id',
                    to: 'users.id',
                    through: {
                        from: 'comic_user.comic_id',
                        to: 'comic_user.user_id'
                    }
                }
            },
            comicPanels: {
                relation: objection_1.OneToManyRelation,
                modelClass: ComicPanel_1.ComicPanel,
                join: {
                    from: 'comics.id',
                    to: 'comic_panels.comic_id'
                }
            }
        };
    }
}
exports.Comic = Comic;
