'use strict';

import {OneToManyRelation, ManyToManyRelation} from 'objection';
import {User} from './User';
import {ComicPanel} from './ComicPanel';
import {BaseModel} from './BaseModel';

export class Comic extends BaseModel {
    static get tableName():string {
        return 'comics';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'title', 'created_at', 'updated_at'],
            properties: {
                id: {type: 'string', minLength: 36, maxLength: 36},
                title: {type: 'string', maxLength: 255}
            }
        }
    }

    static get relationMappings() {
        return {
            users: {
                relation: ManyToManyRelation,
                modelClass: User,
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
                relation: OneToManyRelation,
                modelClass: ComicPanel,
                join: {
                    from: 'comics.id',
                    to: 'comic_panels.comic_id'
                }
            }
        }
    }
}
