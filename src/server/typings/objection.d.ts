declare module 'objection' {
    class ModelBase {

    }

    class Model extends ModelBase {
        static all():any;
        static query():any;
        static knex(config:any):void;

        $relatedQuery(queryContext:any):any;
        $loadRelated(relationships:string):any;
        $query():any;
    }

    class OneToManyRelation {}
    class OneToOneRelation {}
    class ManyToManyRelation {}
}
