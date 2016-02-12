'use strict';

import {BaseModel} from "./BaseModel";
import {Comic} from "./Comic";
import {SpeechBubble} from "./SpeechBubble";
import {Model, OneToOneRelation, OneToManyRelation} from 'objection';

export class ComicPanel extends BaseModel {
    comic_id:string;
    position:number;

    static get tableName():string {
        return 'comic_panels';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['position'],
            properties: {
                id: {type: 'string', minLength: 36, maxLength: 36},
                comic_id: {type: 'string', minLength: 36, maxLength: 36},
                created_at: {type: 'string', maxLength: 255},
                updated_at: {type: 'string', maxLength: 255},
                position: {type: 'integer'}
            }
        }
    }

    static get relationMappings() {
        return {
            comic: {
                relation: OneToOneRelation,
                modelClass: Comic,
                join: {
                    from: 'comic_panels.comic_id',
                    to: 'comics.id'
                }
            },
            speechBubbles: {
                relation: OneToManyRelation,
                modelClass: SpeechBubble,
                join: {
                    from: 'comic_panels.id',
                    to: 'speech_bubbles.comic_panel_id'
                }
            }
        }
    }

    /**
     * stub
     * TODO: implement custom background images
     * @returns {string}
     */
    get backgroundImageUrl():string {
        return '/images/comic-panel-placeholder.png';
    }

    get speechBubblesUrl():string {
        return '/comics/'+ this.comic_id +'/panels/' + this.id + '/speech-bubbles'
    }
}
