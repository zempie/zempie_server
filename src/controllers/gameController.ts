import * as _ from 'lodash';
import { IGameParams, IUser } from './_interfaces';
import { Sequelize, Transaction, Op } from 'sequelize';
import { dbs, caches } from "../commons/globals";
import redis from '../database/redis';
import TimelineController from './timelineController';
import { eTimeline } from "../commons/enums";
import { gameCache } from "../database/redis/models/games";
import Opt from '../../config/opt';
const { Url, Deploy } = Opt;


class GameController {

    gameStart = async ({game_uid}: IGameParams, user: IUser) => {
        // const user_uid = user.uid;
        // await dbs.GameLog.create({
        //     user_uid: uid,
        //     game_uid
        // });

        return {
            value: 'okokoaksfojasdlkfjs'
        }
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
                if( record ) {
                    record.score = score;
                    await record.save({transaction});
                }
                else {
                    await dbs.UserGame.create({user_uid, game_uid, score}, transaction);
                }
            }

            // 임시
            await TimelineController.doPosting({type: eTimeline.PR, score, game_uid}, user, transaction);

            return {
                new_record
            }
        })
    }


    getGameList = async ({}, user: IUser, transaction?: Transaction) => {
        const games = await gameCache.get()
        return {
            games
        }
    }


    getGlobalRanking = async ({game_uid, limit = 50, skip = 0}: IGameParams, {uid}: IUser, transaction?: Transaction) => {
        let score, rank;
        const gameRecord = await dbs.UserGame.findOne({game_uid, user_uid: uid}, transaction);
        if( gameRecord ) {
            score = gameRecord.score;
            rank = await dbs.UserGame.model.count({
                where: {
                    game_uid,
                    score: {
                        [Op.gt]: score
                    },
                },
                order: [['score', 'desc']],
                transaction
            });
            rank += 1;
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
            skip,
            transaction
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
                    displayName: user.display_name,
                    photoURL: user.photo_url,
                    score,
                }
            })
        }
    }


    getFollowingRanking = async ({game_uid, limit = 50, skip = 0}: IGameParams, {uid}: IUser, transaction?: Transaction) => {
        let score, rank;
        const gameRecord = await dbs.UserGame.findOne({game_uid, user_uid: uid}, transaction);
        if( gameRecord ) {
            score = gameRecord.score;
            rank = await dbs.Follow.model.count({
                where: { user_uid: uid },
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
            where: { user_uid: uid },
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
            limit, skip, transaction
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
                    displayName: target.display_name,
                    photoURL: target.photo_url,
                    score: gameRecord.score,
                }
            })
        }
    }
}


export default new GameController()