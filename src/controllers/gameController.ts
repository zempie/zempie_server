import * as _ from 'lodash';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { IGameParams, IGamePlayParams, IRoute } from './_interfaces';
import { Op, Sequelize, Transaction } from 'sequelize';
import { caches, dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { Producer } from '../services/kafkaService';
import Opt from '../../config/opt';
const { Url, Deploy } = Opt;


class GameController {

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
        const { uid: user_uid } = user;
        // const user_uid = user.uid;
        // const userRecord = await dbs.User.findOne({ uid: user_uid });
        // const game = await dbs.Game.findOne({ uid: game_uid });
        // if ( !game ) {
        //     throw CreateError(ErrorCodes.INVALID_GAME_UID);
        // }
        //
        // const user_id = userRecord.id;
        // const game_id = game.id;

        Producer.send([{
            topic: 'gameOver',
            messages: JSON.stringify({
                user_uid,
                game_uid,
                score,
                pid,
            }),
        }])

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


    getGame = async ({pathname}: any, user: DecodedIdToken, transaction?: Transaction) => {
        // const games = await gameCache.get();
        // const game = _.find(games, (obj:any) => obj.pathname === pathname)
        const game = await dbs.Game.findOne({ pathname }, transaction);
        return {
            game
        }
    }

    getGameList = async ({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }, user: DecodedIdToken) => {
        // const games = await gameCache.get()
        const { count, rows } = await dbs.Game.getList({limit, offset, sort, dir});
        return {
            count,
            games: _.map(rows, (game: any) => {
                const { developer } = game;
                return {
                    game_uid: game.uid,
                    title: game.title,
                    pathname: game.pathname,
                    version: game.version,
                    control_type: game.control_type,
                    genre_arcade: game.genre_arcade,
                    genre_puzzle: game.genre_puzzle,
                    genre_racing: game.genre_racing,
                    genre_sports: game.genre_sports,
                    url_game: game.url_game,
                    url_thumb: game.url_thumb,
                    share_url: user? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
                    developer: developer? {
                        uid: developer.uid,
                        name: developer.name,
                        picture: developer.picture,
                    } : null
                }
            })
        }
    }

    playGame = async ({ pathname, user_uid }: IGamePlayParams) => {
        if ( !user_uid ) {
            return;
        }

        Producer.send([{
            topic: 'pubPlayGame',
            messages: JSON.stringify({
                pathname,
                user_uid,
            })
        }])
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


    /**
     * 랭킹
     */
    getGlobalRanking = async ({ game_uid, limit = 50, offset = 0 }: IGameParams, {uid: user_uid}: DecodedIdToken) => {
        let score, rank;

        // const userRecord = await dbs.User.findOne({ uid });
        // const game = await dbs.Game.findOne({ uid: game_uid });
        // if ( !game ) {
        //     throw CreateError(ErrorCodes.INVALID_GAME_UID);
        // }
        //
        // const user_id = userRecord.id;
        // const game_id = game.id;

        if ( user_uid ) {
            const gameRecord = await dbs.UserGame.findOne({game_uid, user_uid});
            if ( gameRecord ) {
                score = gameRecord.score;
                rank = await dbs.UserGame.model.count({
                    where: {
                        game_uid,
                        score: {
                            [Op.gt]: score
                        },
                    },
                    order: [['score', 'desc']],
                });
                rank += 1;
            }
        }

        const { count, rows } = await dbs.UserGame.model.findAndCountAll({
            where: { game_uid },
            include: [{
                model: dbs.User.model,
            }],
            attributes: {
                include: [
                    [Sequelize.literal('(RANK() OVER (ORDER BY score DESC))'), 'rank'],
                ],
            },
            limit,
            offset
        });

        return {
            count,
            rank,
            score,
            list: _.map(rows, (record: any) => {
                const { rank, user, score } = record.get({plain: true});
                return {
                    rank,
                    user_uid: user.uid,
                    name: user.name,
                    picture: user.picture,
                    score,
                }
            })
        }
    }


    getFollowingRanking = async ({game_uid, limit = 50, offset = 0}: IGameParams, {uid: user_uid}: DecodedIdToken, transaction?: Transaction) => {
        let score, rank;

        const gameRecord = await dbs.UserGame.findOne({game_uid, user_uid}, transaction);
        if( gameRecord ) {
            score = gameRecord.score;
            rank = await dbs.Follow.model.count({
                where: { user_uid },
                include: [{
                    model: dbs.UserGame.model,
                    as: 'gameRecord',
                    where: {
                        game_uid,
                        score: {
                            [Op.gt]: score,
                        }
                    }
                }],
            })
            rank += 1;
        }

        const { count, rows } = await dbs.Follow.model.findAndCountAll({
            where: { user_uid },
            include: [{
                model: dbs.UserGame.model,
                as: 'gameRecord',
                where: { game_uid },
            }, {
                model: dbs.User.model,
                as: 'target',
            }],
            attributes: {
                include: [
                    [Sequelize.literal('(RANK() OVER (ORDER BY gameRecord.score DESC))'), 'rank'],
                ]
            },
            limit, offset, transaction
        });

        return {
            count,
            rank,
            score,
            list: _.map(rows, (record: any) => {
                const { rank, target, gameRecord } = record.get({plain: true});
                return {
                    rank,
                    user_uid: target.uid,
                    name: target.name,
                    picture: target.picture,
                    score: gameRecord.score,
                }
            })
        }
    }

    sampleTest = async ({}, user: {}) => {
        const data = await Producer.send([{
            topic: 'gameOver',
            messages: JSON.stringify({
                key1: 'value1',
                key2: 'value2',
            }),
        }]);
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
        const records = await caches.hashtag.getTag(k);
        return {
            records: _.map(records, JSON.parse)
        };
    }
}


export default new GameController()
