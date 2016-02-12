'use strict';

import {Model} from 'objection';
import * as uuid from 'node-uuid';

export class BaseModel extends Model {
    id:string;
    created_at:string;
    updated_at:string;

    $beforeInsert(queryContext) {
        this.id = uuid.v4();
        var dateString = new Date().toISOString();
        this.created_at = dateString;
        this.updated_at = dateString;
    };

    $beforeUpdate(queryContext) {
        this.updated_at = new Date().toISOString();
    }
}
