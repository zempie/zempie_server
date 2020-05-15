import * as _ from 'lodash';
import { IGameParams, IUser } from './_interfaces';
import { Sequelize, Transaction, Op } from 'sequelize';
import { dbs, caches } from "../commons/globals";
import redis from '../database/redis';
import Opt from '../../config/opt'
const { Url, Deploy } = Opt;

class GameController {

    gameStart = async ({game_uid}: IGameParams, user: IUser) => {
        // const user_uid = user.uid;
        // await dbs.GameLog.create({
        //     user_uid: uid,
        //     game_uid
        // });
    }


    gameOver = async ({game_uid, score}: IGameParams, user: IUser) => {
        const user_uid = user.uid;
        await dbs.GameLog.create({
            user_uid,
            game_uid,
            score
        });

        return await dbs.UserGame.getTransaction(async (transaction: Transaction) => {
            const record = await dbs.UserGame.findOne({user_uid, game_uid}, transaction);
            const previous_score = record? record.score : 0;
            const new_record = score > previous_score;

            if( new_record ) {
                record.score = score;
                await record.save({transaction});
            }

            return {
                new_record
            }
        })
    }


    getList = async ({}, user: IUser, transaction?: Transaction) => {
        const key = `zemini:games:`;
        let _games = await redis.hgetall(key);
        let games;
        if( Object.keys(_games).length <= 0 ) {
            const response = await fetch(`${Url.DeployApiV1}/games?key=${Deploy.api_key}`);
            if( response.status !== 200 ) {
                throw new Error(response.statusText);
            }

            const json = await response.json();
            _games = json.data.games;
            games = _.map(_games, (game: any) => {
                // games[game.uid] = game;
                redis.hset(key, game.game_uid, JSON.stringify(game));
                return game;
            });
            await redis.expire(key, 1000 * 60 * 60 * 12); // 12시간

            caches.games = games;
        }
        else {
            games = _.map(_games, (game: any) => {
                return JSON.parse(game);
            });

            if( !caches.games ) {
                caches.games = games;
            }
        }

        return {
            games
        }
    }


    getGlobalRanking = async ({game_uid, limit = 50, skip = 0}: IGameParams, {uid}: IUser, transaction?: Transaction) => {
        const score = await dbs.UserGame.findOne({user_uid: uid}, transaction);
        const rank = await dbs.UserGame.model.count({
            score: {
                [Op.gt]: score
            },
            transaction
        });

        const { count, rows } = await dbs.UserGame.model.findAndCountAll({
            where: {
                game_uid
            },
            attributes: {
                include: [
                    [Sequelize.literal('(RANK() OVER (ORDER BY score DESC))'), 'rank'],
                ],
            },
            include: [{
                model: dbs.User.model,
                attributes: ['uid', ['display_name', 'displayName'], ['photo_url', 'photoURL']]
            }],
            limit,
            skip,
            transaction
        });

        return {
            count,
            rank,
            list: _.map(rows, (record: any) => {
                const { user } = record;
                return {
                    rank: record.rank,
                    user_uid: user.uid,
                    displayName: user.display_name,
                    photoURL: user.photo_url,
                    score: record.score,
                }
            })
        }
    }


    getFollowingRanking = async ({game_uid, limit = 50, skip = 0}: IGameParams, {uid}: IUser, transaction?: Transaction) => {
        const score = await dbs.UserGame.findOne({user_uid: uid}, transaction);
        const rank = await dbs.UserGame.model.count({
            score: {
                [Op.gt]: score
            },
            transaction
        });

        const { count, rows } = await dbs.UserGame.model.findAndCountAll({
            where: {
                game_uid,
            },
            include: [{
                model: dbs.Follow.model,
                as: 'follow',
                where: {
                    user_uid: uid,
                },
                include: [{
                    model: dbs.User.model,
                    as: 'target',
                }]
            }],
            attributes: {
                include: [
                    [Sequelize.literal('(RANK() OVER (ORDER BY score DESC))'), 'rank'],
                ]
            },
            limit,
            skip,
            transaction
        });

        return {
            count,
            rank,
            list: _.map(rows, (record: any) => {
                const { target, gameRecord } = record;
                return {
                    rank: record.rank,
                    user_uid: target.uid,
                    displayName: target.display_name,
                    photoURL: target.photo_url,
                    score: gameRecord.score,
                }
            })
        }
    }
}


export default new GameController()