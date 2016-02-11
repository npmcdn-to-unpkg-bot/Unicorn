'use strict';

import {OneToOneRelation, ManyToManyRelation} from 'objection';
import {User} from './User';
import {BaseModel} from './BaseModel';
import {Comic} from "./Comic";

export class ComicUser extends BaseModel {
    static idColumn = ['comic_id', 'user_id'];

    static get tableName():string {
        return 'comic_user';
    }

    static get relationMappings() {
        return {
            comics: {
                relation: OneToOneRelation,
                modelClass: Comic,
                join: {
                    from: 'comic_user.comic_id',
                    to: 'comics.comic_id',
                }
            },
            users: {
                relation: OneToOneRelation,
                modelClass: User,
                join: {
                    from: 'comic_user.user_id',
                    to: 'users.user_id',
                }
            },
        }
    }
}
