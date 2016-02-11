'use strict';

import {BaseModel} from "./BaseModel";
import {ComicPanel} from "./ComicPanel";
import {Model, OneToOneRelation} from 'objection';

export class SpeechBubble extends BaseModel {
    static get tableName():string {
        return 'speech_bubbles';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'text', 'created_at', 'updated_at'],
            properties: {
                id: {type: 'string', minLength: 36, maxLength: 36},
                text: {type: 'string'}
            }
        }
    }

    static get relationMappings() {
        return {
            comicPanel: {
                relation: OneToOneRelation,
                modelClass: ComicPanel,
                join: {
                    from: 'speech_bubbles.comic_panel_id',
                    to: 'comic_panels.id'
                }
            }
        }
    }
}
