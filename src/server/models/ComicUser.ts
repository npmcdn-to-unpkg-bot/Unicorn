'use strict';

import {OneToOneRelation, ManyToManyRelation} from 'objection';
import {User} from './User';
import {BaseModel} from './BaseModel';
import {Comic} from "./Comic";

export class ComicUser extends BaseModel {
    comic_id:number;
    user_id:number;

    static get tableName():string {
        return 'comic_user';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                id: { type: 'string', minLength: 36, maxLength: 36 },
                comic_id: { type: 'string', minLength: 36, maxLength: 36 },
                user_id: { type: 'string', minLength: 36, maxLength: 36 },
                is_owner: { type: 'boolean'},
                created_at: {type: 'string', maxLength: 255},
                updated_at: {type: 'string', maxLength: 255},
            }
        }
    }

    static get relationMappings() {
        return {
            comics: {
                relation: OneToOneRelation,
                modelClass: Comic,
                join: {
                    from: 'comic_user.comic_id',
                    to: 'comics.id',
                }
            },
            users: {
                relation: OneToOneRelation,
                modelClass: User,
                join: {
                    from: 'comic_user.user_id',
                    to: 'users.id',
                }
            },
        }
    }
}
