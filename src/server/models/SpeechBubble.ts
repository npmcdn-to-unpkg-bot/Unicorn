'use strict';

import {BaseModel} from "./BaseModel";
import {ComicPanel} from "./ComicPanel";
import {Model, OneToOneRelation} from 'objection';

export class SpeechBubble extends BaseModel {
    position_x:number;
    position_y:number;
    text:string;

    static get tableName():string {
        return 'speech_bubbles';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['text'],
            properties: {
                id: {type: 'string', minLength: 36, maxLength: 36},
                created_at: {type: 'string', maxLength: 255},
                updated_at: {type: 'string', maxLength: 255},
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

    get inlineStyle():string {
        return 'top:' + this.position_y + ';' +
            'left:' + this.position_x + ';'
            ;
    }
}
