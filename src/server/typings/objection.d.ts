declare module 'objection' {
    class ModelBase {

    }

    class Model extends ModelBase {
        static all():any;
        static query():any;
        static knex(config:any):void;

        $relatedQuery(queryContext:any):any;
    }

    class OneToManyRelation {}
    class OneToOneRelation {}
    class ManyToManyRelation {}
}
