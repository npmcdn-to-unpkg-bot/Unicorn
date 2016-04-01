'use strict';

import {BaseModel} from "./BaseModel";
import {Comic} from "./Comic";
import {SpeechBubble} from "./SpeechBubble";
import {Model, BelongsToOneRelation, HasManyRelation} from 'objection';

export class ComicPanel extends BaseModel {
    comic_id:string;
    position:number;
	background_image_url:string;
	title:string;

    static get tableName():string {
        return 'comic_panels';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['position','background_image_url'],
            properties: {
                id: {type: 'string', minLength: 36, maxLength: 36},
                comic_id: {type: 'string', minLength: 36, maxLength: 36},
                created_at: {type: 'string', maxLength: 255},
                updated_at: {type: 'string', maxLength: 255},
                position: {type: 'integer'},
				background_image_url: {type: 'string',maxLength: 255},
				title: {type: 'string',maxLength: 255}
            }
        }
    }

    static get relationMappings() {
        return {
            comic: {
                relation: BelongsToOneRelation,
                modelClass: Comic,
                join: {
                    from: 'comic_panels.comic_id',
                    to: 'comics.id'
                }
            },
            speechBubbles: {
                relation: HasManyRelation,
                modelClass: SpeechBubble,
                join: {
                    from: 'comic_panels.id',
                    to: 'speech_bubbles.comic_panel_id'
                }
            }
        }
    }

    get backgroundImageUrl():string {
        return this.background_image_url;
    }
	
	get replaceBgiUrl():string {
        return '/comics/' + this.id + '/replace-background-image';
    }

    get speechBubblesUrl():string {
        return '/comics/'+ this.comic_id +'/panels/' + this.id + '/speech-bubbles'
    }
		
	
	/**
     * Returns the relative URL to delete an existing panel of this comic.
     * @returns {string}
     */
    get deletePanelUrl():string {
        return '/comics/'+this.id+'/delete-panel'
    }
}
