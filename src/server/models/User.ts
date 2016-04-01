'use strict';

import {OneToManyRelation, ManyToManyRelation} from 'objection';
import {Comic} from './Comic';
import {ComicUser} from './ComicUser';
import {SavedComic} from './SavedComic';
import {BaseModel} from './BaseModel';

export class User extends BaseModel {
    id: string;
    username: string;
    profile_picture_url: string;
    email: string;
    password: string;
    location: string;
    fullname: string;
    gender: string;

    static get tableName(): string {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['username', 'email', 'password', 'profile_picture_url'],
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
                profile_picture_url: { type: 'string', maxLength: 255 }
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
            },
            comicsFromSavedComics: {
                relation: ManyToManyRelation,
                modelClass: Comic,
                join: {
                    from: 'users.id',
                    to: 'comics.id',
                    through: {
                        modelClass: SavedComic,
                        from: 'saved_comics.user_id',
                        to: 'saved_comics.comic_id'
                    }
                }
            }            
        }
    }
    
    canEditComic(comic:Comic):Promise<boolean> {
        var thisUser:User = this;

        if (comic) {
            return comic.contributors
                .then(function(users:User[]) {
                    return users.some(function(user:User):boolean {
                        return thisUser.id === user.id;
                    });
            });
        } else {
            return Promise.resolve(false);
        }
    }

    get profilePictureUrl(): string {
        return this.profile_picture_url;
    }
}
