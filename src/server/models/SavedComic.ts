'use strict';

import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {Comic} from "./Comic";
import {Model, OneToOneRelation} from 'objection';

export class SavedComic extends BaseModel {
	user_id: string;
	comic_id: string;

	static get tableName():string {
		return 'saved_comics';
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['user_id', 'comic_id'],
			properties: {
				user_id: { type: 'string', minLength: 36, maxLength: 36 },
				comic_id: { type: 'string', minLength: 36, maxLength: 36 },
				created_at: {type: 'string', maxLength: 255},
                updated_at: {type: 'string', maxLength: 255}
			}
		}
	}

	static get relationMappings() {
		return {
			user: {
				relation: OneToOneRelation,
				modelClass: User,
				join: {
					from: 'saved_comics.user_id',
					to: 'users.id'
				}
			},
			comic: {
				relation: OneToOneRelation,
				modelClass: Comic,
				join: {
					from: 'saved_comics.comic_id',
					to: 'comics.id'
				}
			}
		}
	}
}