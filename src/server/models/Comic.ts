'use strict';

import {OneToManyRelation, ManyToManyRelation} from 'objection';
import {User} from './User';
import {ComicUser} from './ComicUser';
import {ComicPanel} from './ComicPanel';
import {BaseModel} from './BaseModel';

export class Comic extends BaseModel {
    static get tableName():string {
        return 'comics';
    }

     static get jsonSchema() {
         return {
             type: 'object',
             required: ['title'],
             properties: {
                 id: {type: 'string', minLength: 36, maxLength: 36},
                 created_at: {type: 'string', maxLength: 255},
                 updated_at: {type: 'string', maxLength: 255},
                 title: {type: 'string', maxLength: 255}
             }
         }
     }

    static get relationMappings() {
        return {
            users: {
                relation: ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'comics.id',
                    to: 'users.id',
                    through: {
                        modelClass: ComicUser,
                        from: 'comic_user.comic_id',
                        to: 'comic_user.user_id'
                    }
                }
            },
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

    $afterInsert(queryContext) {
        return this
            .$relatedQuery('comicPanels')
            .insert({ position: 0, background_image_url: '/images/comic-panel-placeholder.png'})
    }

    /**
     * Returns this comic's owner.
     *
     * @returns {User}
     */
    get owner():User {
        return User
            .query()
            .whereExists(
                ComicUser.query()
                    .where('comic_id', this.id)
                    .where('is_owner', true)
            )
            .first();
    }
    
    /**
     * Returns the relative URL to view this comic.
     * @returns {string}
     */
    get url():string {
        return '/comics/'+this.id
    }

    /**
     * Returns the relative URL to edit this comic.
     * @returns {string}
     */
    get editUrl():string {
        return '/comics/'+this.id+'/edit'
    }

    /**
     * Returns the relative URL to manage this comic's collaborators.
     * @returns {string}
     */
    get manageCollaboratorsUrl():string {
        return '/comics/'+this.id+'/collaborators'
    }

    /**
     * Returns the relative URL to favourite this comic.
     * @returns {string}
     */
    get favouriteUrl(): string {
        return '/comics/' + this.id + '/favourite'
    }

	/**
     * Returns the relative URL to add a new panel to this comic.
     * @returns {string}
     */
    get addPanelUrl():string {
        return '/comics/'+this.id+'/add-panel'
    }
	
}