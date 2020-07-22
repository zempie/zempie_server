import * as _ from 'lodash';
import { Request, Response } from 'express';
import { IGame, IGameParams, IGamePlayParams, IUser } from './_interfaces';
import { Sequelize, Transaction, Op } from 'sequelize';
import { dbs, caches } from "../commons/globals";
import redis from '../database/redis';
import TimelineController from './timelineController';
import { eTimeline } from "../commons/enums";
import { gameCache } from "../database/redis/models/games";
import Opt from '../../config/opt';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
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


    gameOver = async (params: any, user: IUser) => {
        const {game_uid, score}: IGameParams = params;
        const user_uid = user.uid;
        const userRecord = await dbs.User.findOne({ uid: user_uid });
        const game = await dbs.Game.findOne({ uid: game_uid });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_UID);
        }

        const user_id = userRecord.id;
        const game_id = game.id;

        await dbs.GameLog.create({
            user_id,
            game_id,
            score
        });

        return await dbs.UserGame.getTransaction(async (transaction: Transaction) => {
            const record = await dbs.UserGame.findOne({user_id, game_id}, transaction);
            const previous_score = record? record.score : 0;
            const new_record = score > previous_score;

            if( new_record ) {
                if( record ) {
                    record.score = score;
                    await record.save({transaction});
                }
                else {
                    await dbs.UserGame.create({user_id, game_id, score}, transaction);
                }
            }

            // 임시
            await TimelineController.doPosting({type: eTimeline.PR, score, game_uid, game_id, user_id}, user, transaction);

            return {
                new_record
            }
        })
    }


    getGame = async ({pathname}: any, user: IUser, transaction?: Transaction) => {
        // const games = await gameCache.get();
        // const game = _.find(games, (obj:any) => obj.pathname === pathname)
        const game = await dbs.Game.findOne({ pathname }, transaction);
        return {
            game
        }
    }
    getGameList = async ({}, user: IUser, transaction?: Transaction) => {
        // const games = await gameCache.get()
        const games = await dbs.Game.getList();
        return {
            games: _.map(games, (game: any) => {
                const { developer } = game;
                return {
                    game_uid: game.uid,
                    title: game.title,
                    version: game.version,
                    control_type: game.control_type,
                    genre_arcade: game.genre_arcade,
                    genre_puzzle: game.genre_puzzle,
                    genre_racing: game.genre_racing,
                    genre_sports: game.genre_sports,
                    url_game: game.url_game,
                    url_thumb: game.url_thumb,
                    share_url: `http://api.zempie.com/game/game_path/${user? user.uid : undefined}`,
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

        const game = await dbs.Game.findOne({ title: pathname });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_UID);
        }

        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.findOne({ uid: user_uid }, transaction);
            if ( user ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            await dbs.UserPublishing.updateCount({ user_id: user.id, game_id: game.id, type: 'open' }, transaction);
        })
    }

    redirectGame = (req: Request, res: Response) => {
        const params = _.assignIn({}, req.body, req.query, req.params);
        res.redirect(`http://localhost:8080/#/play/${params.pathname}`)
    }


    /**
     * 랭킹
     */
    getGlobalRanking = async ({ game_uid, limit = 50, offset = 0 }: IGameParams, {uid}: IUser, transaction?: Transaction) => {
        let score, rank;

        const userRecord = await dbs.User.findOne({ uid });
        const game = await dbs.Game.findOne({ uid: game_uid });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_UID);
        }

        const user_id = userRecord.id;
        const game_id = game.id;

        const gameRecord = await dbs.UserGame.findOne({game_id, user_id}, transaction);
        if ( gameRecord ) {
            score = gameRecord.score;
            rank = await dbs.UserGame.model.count({
                where: {
                    game_id,
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
            where: { game_id },
            include: [{
                model: dbs.User.model,
            }],
            attributes: {
                include: [
                    [Sequelize.literal('(RANK() OVER (ORDER BY score DESC))'), 'rank'],
                ],
            },
            limit,
            offset,
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
                    name: user.name,
                    picture: user.picture,
                    score,
                }
            })
        }
    }


    getFollowingRanking = async ({game_uid, limit = 50, offset = 0}: IGameParams, {uid}: IUser, transaction?: Transaction) => {
        let score, rank;

        const userRecord = await dbs.User.findOne({ uid });
        const game = await dbs.Game.findOne({ uid: game_uid });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_UID);
        }

        const user_id = userRecord.id;
        const game_id = game.id;

        const gameRecord = await dbs.UserGame.findOne({game_id, user_id}, transaction);
        if( gameRecord ) {
            score = gameRecord.score;
            rank = await dbs.Follow.model.count({
                where: { user_id },
                include: [{
                    model: dbs.UserGame.model,
                    as: 'gameRecord',
                    where: {
                        game_id,
                        score: {
                            [Op.gt]: score,
                        }
                    }
                }],
            })
            rank += 1;
        }

        const { count, rows } = await dbs.Follow.model.findAndCountAll({
            where: { user_id },
            include: [{
                model: dbs.UserGame.model,
                as: 'gameRecord',
                where: { game_id },
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
}


export default new GameController()
