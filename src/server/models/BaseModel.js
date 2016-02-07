'use strict';
var objection_1 = require('objection');
var uuid = require('node-uuid');
class BaseModel extends objection_1.Model {
    $beforeInsert() {
        this.id = uuid.v4();
        var date = new Date().toISOString();
        this.created_at = date;
        this.updated_at = date;
    }
    ;
    $beforeUpdate() {
        this.updated_at = new Date().toISOString();
    }
}
exports.BaseModel = BaseModel;
