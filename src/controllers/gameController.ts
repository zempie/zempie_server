import * as _ from 'lodash';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { IGameListParams, IGameParams, IGamePlayParams, IRoute } from './_interfaces';
import { Transaction } from 'sequelize';
import { caches, dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import MQ from '../services/messageQueueService';
import Opt from '../../config/opt';
const { Url } = Opt;


class GameController {
    playGame = async ({ pathname, user_uid }: IGamePlayParams) => {
        if ( !user_uid ) {
            return;
        }

        MQ.send({
            topic: 'pubPlayGame',
            messages: [{
                value: JSON.stringify({
                    pathname,
                    user_uid,
                })
            }]
        })
    }

    redirectGame = ({ pathname, pid }: any, user: any, { req, res }: IRoute) => {
        // const { pathname, pid } = _.assignIn({}, req.body, req.query, req.params);
        let url = `${Url.GameClient}/${pathname}`;
        if ( pid ) {
            url += `/${pid}`;
        }
        res.redirect(url);
    }
    // redirectGame = (req: Request, res: Response) => {
    //     const { pathname, pid } = _.assignIn({}, req.body, req.query, req.params);
    //     let url = `${Url.GameClient}/${pathname}`;
    //     if ( pid ) {
    //         url += `/${pid}`;
    //     }
    //     res.redirect(url);
    // }

    gameStart = async ({game_uid}: IGameParams, user: DecodedIdToken) => {
        // const user_uid = user.uid;
        // await dbs.GameLog.create({
        //     user_uid: uid,
        //     game_uid
        // });

        return {
            value: 'okokoaksfojasdlkfjs'
        }
    }


    gameOver = async ({ game_uid, score, pid }: IGameParams, user: DecodedIdToken) => {
        const user_uid = user? user.uid : null;
        // const { uid: user_uid } = user;
        // const user_uid = user.uid;
        // const userRecord = await dbs.User.findOne({ uid: user_uid });
        // const game = await dbs.Game.findOne({ uid: game_uid });
        // if ( !game ) {
        //     throw CreateError(ErrorCodes.INVALID_GAME_UID);
        // }
        //
        // const user_id = userRecord.id;
        // const game_id = game.id;

        MQ.send({
            topic: 'gameOver',
            messages: [{
                value: JSON.stringify({
                    user_uid,
                    game_uid,
                    score,
                    pid,
                }),
            }]
        })

        if ( !user_uid ) {
            return ;
        }

        return await dbs.UserGame.getTransaction(async (transaction: Transaction) => {
            const record = await dbs.UserGame.findOne({user_uid, game_uid}, transaction);
            const previous_score = record? record.score : 0;
            const new_record = score > previous_score;

            if ( new_record ) {
                if ( record ) {
                    record.score = score;
                    await record.save({transaction});
                } else {
                    await dbs.UserGame.create({user_uid, game_uid, score}, transaction);
                }
            }

            return {
                new_record
            }
        })
    }


    getGame = async ({pathname}: any, _user: DecodedIdToken) => {
        let game = await caches.game.get(pathname);
        if ( !game ) {
            game = await dbs.Game.getInfo({ pathname });
            const { user } = game;
            game = {
                game_uid: game.uid,
                official: game.official,
                title: game.title,
                pathname: game.pathname,
                version: game.version,
                control_type: game.control_type,
                hashtags: game.hashtags,
                count_over: game.count_over,
                url_game: game.url_game,
                url_thumb: game.url_thumb,
                // share_url: user? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
                user: user? {
                    uid: user.uid,
                    name: user.name,
                    picture: user.picture,
                    channel_id: user.channel_id,
                } : null
            }
            caches.game.set(game);
        }
        return {
            game
        };
    }

    getGameList = async ({ limit = 50, offset = 0, official }: IGameListParams, user: DecodedIdToken, { req }: IRoute) => {
        const query = JSON.stringify(req.query);
        let games = await caches.game.getList(query);
        if ( !games ) {
            const rows = await dbs.Game.getList({limit, offset, official});
            games = _.map(rows, (game: any) => {
                const { user } = game;
                return {
                    game_uid: game.uid,
                    official: game.official,
                    title: game.title,
                    pathname: game.pathname,
                    version: game.version,
                    control_type: game.control_type,
                    hashtags: game.hashtags,
                    count_over: game.count_over,
                    url_game: game.url_game,
                    url_thumb: game.url_thumb,
                    // share_url: user? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
                    user: user? {
                        uid: user.uid,
                        name: user.name,
                        picture: user.picture,
                        channel_id: user.channel_id,
                    } : null
                }
            })

            caches.game.setList(games, query);
        }

        return {
            games
        }
    }

    getGameListByHashtag = async ({ tag }: { tag: string }, user: DecodedIdToken) => {
        const games = await caches.hashtag.findAll(tag)
        return {
            games: _.map(games, game => JSON.parse(game))
        }
    }



    sampleTest = async ({}, user: {}) => {
        const data = await MQ.send({
            topic: 'gameOver',
            messages: [{
                value: JSON.stringify({
                    key1: 'value1',
                    key2: 'value2',
                }),
            }]
        });
        console.log(data)
        console.log('sent')
    }

    cacheTest = async () => {
        caches.hashtag.addTag('arcade', 'papa', JSON.stringify({
            uid: 'papa123',
            title: 'basketball papa',
        }))
        caches.hashtag.addTag(['#arcade', 'puzzle'], 'shark', JSON.stringify({
            uid: 'shark000',
            title: 'shark frenzy',
        }))
    }
    cacheTest2 = async ({k}: any) => {
        const records = await caches.hashtag.findAll(k);
        return {
            records: _.map(records, JSON.parse)
        };
    }
}


export default new GameController()
