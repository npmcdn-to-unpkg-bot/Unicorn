'use strict';

import {Model} from 'objection';
import * as uuid from 'node-uuid';

export class BaseModel extends Model {
    id:string;
    created_at:string;
    updated_at:string;

    $beforeInsert() {
        this.id = uuid.v4();
        var date = new Date().toISOString();
        this.created_at = date;
        this.updated_at = date;
    };

    $beforeUpdate() {
        this.updated_at = new Date().toISOString();
    }
}
