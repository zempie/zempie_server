import * as _ from 'lodash';
import * as path from 'path';
import { Db, MongoClient } from 'mongodb';
import { docs, dbs } from '../../commons/globals';
import { capitalize, getFiles } from '../../commons/utils';
import { Collection } from './collection';
import User from './collections/user/user';
import Game from './collections/game';


const host = 'mongodb://localhost:27017';
const database = 'zempie';




class MongoDB {
    private db: Db | undefined;

    public async initialize() {
        const options = {
            useUnifiedTopology: true,
        };
        // MongoClient.connect(host, options, async (error, client) => {
        //     if ( error ) {
        //         return reject(error);
        //     }
        //
        //     this.db = client.db(database);
        //
        //     await this.syncDefine();
        //
        //     await this.migration(this.db);
        //
        //     resolve(this.db);
        // });
        const client = await MongoClient.connect(host, options);
        this.db = client.db(database);
        await this.syncDefine();
        // await this.migration(this.db);
    }

    private async syncDefine() {
        // const collections: any = {};
        const dir = path.join(__dirname, '/collections');

        getFiles(dir, (dir: string, file: string) => {
            if ( !!this.db ) {
                const collection: any = require(path.join(dir, file)).default(this.db);
                docs[capitalize(collection.getName())] = collection;
            }
        })

        for ( const i in docs ) {
            if ( docs.hasOwnProperty(i) ) {
                const collection = docs[i];
                if ( collection instanceof Collection ) {
                    await collection.afterSync();
                }
            }
        }
        // _.forEach(collections, async (collection: any) => {
        //     await collection.afterSync();
        // });
    }

    private async migration (db: Db) {
        const userCollection = User(db);
        let users = await dbs.User.model.findAll({
            include: [{
                model: dbs.UserProfile.model,
                as: 'profile',
            }, {
                model: dbs.UserGame.model,
                as: 'gameRecords',
            }, {
                model: dbs.Game.model,
                as: 'devGames',
            }]
        });
        const arr = _.map(users, (r: any) => {
            const obj = r.get({ plain: true });
            const { profile, gameRecords, devGames } = obj;
            return {
                uid: obj.uid,
                activated: obj.activated,
                banned: obj.banned,
                name: obj.name,
                channel_id: obj.channel_id,
                picture: obj.picture,
                provider: obj.provider,
                email: obj.email,
                email_verified: obj.email_verified,
                fcm_token: obj.fcm_token,
                is_developer: obj.is_developer,
                last_log_in: obj.last_log_in,
                profile: {
                    level: profile.level,
                    state_msg: profile.state_msg,
                    description: profile.description,
                    url_banner: profile.url_banner,
                },
                created_at: r.created_at,
                updated_at: r.updated_at,
                deleted_at: r.deleted_at,
            }
        })
        await userCollection.bulkCreate(arr);


        /**
         * game
         */
        let games = await dbs.Game.model.findAll({})
        let gameArr = _.map(games, (game: any) => {
            const r = game.get({ plain: true });
            return {
                activated: r.activated,
                enabled: r.enabled,
                official: r.official,
                user_id: r.user_id,
                pathname: r.pathname,
                title: r.title,
                description: r.description,
                version: r.version,
                control_type: r.control_type,
                hashtags: r.hashtags,
                count_start: r.count_start,
                count_over: r.count_over,
                url_game: r.url_game,
                url_thumb: r.url_thumb,
                url_thumb_webp: r.url_thumb_webp,
                url_thumb_gif: r.url_thumb_gif,
                created_at: r.created_at,
                updated_at: r.updated_at,
                deleted_at: r.deleted_at,
            };
        });
        const gameCollection = Game(db);
        await gameCollection.bulkCreate(gameArr);
        console.log('???????')
    }
}


export default new MongoDB()
