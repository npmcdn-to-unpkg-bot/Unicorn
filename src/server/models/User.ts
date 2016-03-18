'use strict';

import {OneToManyRelation, ManyToManyRelation} from 'objection';
import {Comic} from './Comic';
import {ComicUser} from './ComicUser';
import {SavedComic} from './SavedComic';
import {BaseModel} from './BaseModel';

export class User extends BaseModel {
    static get tableName(): string {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['username', 'email', 'password'],
            properties: {
                id: { type: 'string', minLength: 36, maxLength: 36 },
                created_at: { type: 'string', maxLength: 255 },
                updated_at: { type: 'string', maxLength: 255 },
                username: { type: 'string', maxLength: 255 },
                email: { type: 'string', maxLength: 255 },
                password: { type: 'string', maxLength: 255 },
                location: { type: 'string', maxLength: 255 },
                fullname: { type: 'string', maxLength: 255 },
                gender: { type: 'string', maxLength: 255},
                saved_comics: { type: 'string', minLength: 36, maxLength: 36 }
            }
        }
    }

    static queryContributors() {
        return this.query()
            .join('comic_user', 'users.id', '=', 'comic_user.user_id');
    }

    static get relationMappings() {
        return {
            comics: {
                relation: ManyToManyRelation,
                modelClass: Comic,
                join: {
                    from: 'users.id',
                    to: 'comics.id',
                    through: {
                        modelClass: ComicUser,
                        from: 'comic_user.user_id',
                        to: 'comic_user.comic_id'
                    }
                }
            },
            savedComics: {
                relation: OneToManyRelation,
                modelClass: SavedComic,
                join: {
                    from: 'users.id',
                    to: 'saved_comics.user_id'
                }
            }
            
        }
    }
}
