'use strict';
var BaseModel_1 = require("./BaseModel");
var ComicPanel_1 = require("./ComicPanel");
var objection_1 = require('objection');
class SpeechBubble extends BaseModel_1.BaseModel {
    static get tableName() {
        return 'speech_bubbles';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'text', 'created_at', 'updated_at'],
            properties: {
                id: { type: 'string', minLength: 36, maxLength: 36 },
                text: { type: 'string' }
            }
        };
    }
    static get relationMappings() {
        return {
            comicPanel: {
                relation: objection_1.OneToOneRelation,
                modelClass: ComicPanel_1.ComicPanel,
                join: {
                    from: 'speech_bubbles.comic_panel_id',
                    to: 'comic_panels.id'
                }
            }
        };
    }
}
exports.SpeechBubble = SpeechBubble;
