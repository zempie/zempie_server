import * as uniqid from 'uniqid';
import * as _ from 'lodash';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { IGameListParams, IGameParams, IGamePlayParams, IRoute } from '../_interfaces';
import { Op, Transaction } from 'sequelize';
import { caches, dbs } from '../../commons/globals';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import MQ from '../../services/messageQueueService';
import Opt from '../../../config/opt';
import { getGameData } from '../_common';
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

    gameStart = async ({game_id}: IGameParams, user: DecodedIdToken) => {
        // const user_uid = user.uid;
        // await dbs.GameLog.create({
        //     user_uid: uid,
        //     game_uid
        // });

        return {
            value: 'okokoaksfojasdlkfjs'
        }
    }


    gameOver = async ({ game_id, score, pid }: IGameParams, user: DecodedIdToken) => {
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
                    game_id,
                    score,
                    pid,
                }),
            }]
        })

        if ( !user_uid ) {
            return ;
        }

        return await dbs.UserGame.getTransaction(async (transaction: Transaction) => {
            const record = await dbs.UserGame.findOne({user_uid, game_id}, transaction);
            const previous_score = record? record.score : 0;
            const new_record = score > previous_score;

            if ( new_record ) {
                if ( record ) {
                    record.score = score;
                    await record.save({transaction});
                } else {
                    await dbs.UserGame.create({user_uid, game_id, score}, transaction);
                }
            }

            return {
                new_record
            }
        })
    }


    getGame = async ({pathname}: any, _user: DecodedIdToken) => {
        // let game = await caches.game.getByPathname(pathname);
        // if ( !game ) {
        //     game = await dbs.Game.getInfo({ pathname });
        //     game = getGameData(game);
        //     caches.game.setByPathname(game);
        //     caches.game.setByPathname(ret, pathname);
        // }
        // return {
        //     game
        // };
        let ret = await caches.game.getByPathname(pathname);
        if ( !ret ) {
            const game = await dbs.Game.getInfo({ pathname });
            ret = {
                game: getGameData(game),
            }
            caches.game.setByPathname(ret, pathname);
        }
        // const game = await dbs.Game.getInfo({ pathname });
        // const ret = {
        //     game: getGameData(game),
        // }
        return ret;
    }

    getGameList = async ({ limit = 50, offset = 0, official }: IGameListParams, user: DecodedIdToken, { req }: IRoute) => {
        const query = JSON.stringify(req.query);
        let games = await caches.game.getList(query);
        if ( !games ) {
            const rows = await dbs.Game.getList({limit, offset, official});
            games = _.map(rows, game => getGameData(game))

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


    tagTest = async ({ title, hashtags }: any, user: DecodedIdToken) => {
        await dbs.Game.getTransaction(async (transaction: Transaction) => {
            const game = await dbs.Game.create( {
                // uid : uuid(),
                activated : 0,
                enabled : 0,
                user_id : 16,
                pathname : uniqid(),
                title,
                description : '',
                hashtags,
                // version : version.version,
                // url_game : version.url,
                url_thumb : '',
                url_thumb_gif : '',
            }, transaction);

            await dbs.Hashtag.addTags(game.id, hashtags, transaction);
        })
    }

    tagTest2 = async ({ tag }: any) => {
        const r = await dbs.Hashtag.getGamesByTagLike(tag);

        return {
            tag,
            games: _.map(r?.refTags, (ref: any) => getGameData(ref.game))
        }
    }
}


export default new GameController()
