 'use strict';

import {OneToManyRelation, ManyToManyRelation} from 'objection';
import {Comic} from './Comic';
import {BaseModel} from './BaseModel';

export class User extends BaseModel {
    static get tableName():string {
        return 'users';
    }

    // static get jsonSchema() {
    // return {
        // type: 'object',
        // required: ['id', 'username', 'created_at', 'updated_at'],
        // properties: {
            // id: {type: 'string', minLength: 36, maxLength: 36},
            // username: {type: 'string', maxLength: 255}
        // }
    // }

    static get relationMappings() {
        return {
            comics: {
                relation: ManyToManyRelation,
                modelClass: Comic,
                join: {
                    from: 'users.id',
                    to: 'comics.id',
                    through: {
                        from: 'comic_user.user_id',
                        to: 'comic_user.comic_id'
                    }
                }
            }
        }
    }
}
