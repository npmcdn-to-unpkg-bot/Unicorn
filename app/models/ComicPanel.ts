'use strict';

import {BaseModel} from "./BaseModel";

import {Model, OneToManyRelation} from 'objection';

export class ComicPanel extends BaseModel {
    static get tableName():string {
        return 'comic_panels';
    }
}
