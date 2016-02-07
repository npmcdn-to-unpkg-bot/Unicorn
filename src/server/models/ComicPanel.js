'use strict';
var BaseModel_1 = require("./BaseModel");
var Comic_1 = require("./Comic");
var SpeechBubble_1 = require("./SpeechBubble");
var objection_1 = require('objection');
class ComicPanel extends BaseModel_1.BaseModel {
    static get tableName() {
        return 'comic_panels';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'position', 'created_at', 'updated_at'],
            properties: {
                id: { type: 'string', minLength: 36, maxLength: 36 },
                position: { type: 'integer' }
            }
        };
    }
    static get relationMappings() {
        return {
            comic: {
                relation: objection_1.OneToOneRelation,
                modelClass: Comic_1.Comic,
                join: {
                    from: 'comic_panels.comic_id',
                    to: 'comics.id'
                }
            },
            speechBubbles: {
                relation: objection_1.OneToManyRelation,
                modelClass: SpeechBubble_1.SpeechBubble,
                join: {
                    from: 'comic_panels.id',
                    to: 'speech_bubbles.comic_panel_id'
                }
            }
        };
    }
}
exports.ComicPanel = ComicPanel;
