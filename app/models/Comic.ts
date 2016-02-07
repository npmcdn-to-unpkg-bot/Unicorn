'use strict';

import {OneToManyRelation} from 'objection';
import {ComicPanel} from './ComicPanel';
import {BaseModel} from './BaseModel';

export class Comic extends BaseModel {
    static get tableName():string {
        return 'comics';
    }

    static get relationMappings() {
        return {
            comicPanels: {
                relation: OneToManyRelation,
                modelClass: ComicPanel,
                join: {
                    from: 'comics.id',
                    to: 'comic_panels.comic_id'
                }
            }
        }
    }
}
