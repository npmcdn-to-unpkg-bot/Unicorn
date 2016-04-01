'use strict';

import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {Comic} from "./Comic";
import {Model, BelongsToOneRelation} from 'objection';

export class SavedComic extends BaseModel {
	static get tableName():string {
		return 'saved_comics';
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['user_id', 'comic_id'],
			properties: {
				is_updated: { type: 'boolean'},
				receive_saved_comic_email: { type: 'boolean'},
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
				relation: BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'saved_comics.user_id',
					to: 'users.id'
				}
			},
			comic: {
				relation: BelongsToOneRelation,
				modelClass: Comic,
				join: {
					from: 'saved_comics.comic_id',
					to: 'comics.id'
				}
			}
		}
	}
	
}