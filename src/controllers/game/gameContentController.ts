import * as _ from 'lodash';
import { caches, dbs } from '../../commons/globals';
import { Transaction } from 'sequelize';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { parseBoolean } from '../../commons/utils';
import MQ from '../../services/messageQueueService';

interface IGameHeartParams {
    game_id: number
    on: boolean
}
interface IGameEmotionParams {
    game_id: number
    e_id: string
    on: boolean
}

class GameContentController {
    heart = async ({ game_id, on }: IGameHeartParams, user: DecodedIdToken) => {
        const user_uid = user.uid;
        const game = await dbs.Game.findOne({ id: game_id });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_ID);
        }

        const changed = await dbs.GameHeart.likeIt(game_id, user_uid, on);

        if ( changed ) {
            caches.game.delByPathname(game.pathname, user_uid);
            MQ.send({
                topic: 'gameHeart',
                messages: [{
                    value: JSON.stringify({
                        user_uid,
                        game_id,
                        activated: on,
                    })
                }]
            })
        }

        return {
            heart_on: on,
        }
    }


    emotion = async ({ game_id, e_id, on }: IGameEmotionParams, user: DecodedIdToken) => {
        const user_uid = user.uid;
        const game = await dbs.Game.findOne({ id: game_id });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_ID);
        }

        const changed = await dbs.UserGameEmotion.feelLike(game_id, user_uid, e_id, on);

        if ( changed ) {
            caches.game.delByPathname(game.pathname, user_uid);
            MQ.send({
                topic: 'gameEmotion',
                messages: [{
                    value: JSON.stringify({
                        user_uid,
                        game_id,
                        e_id,
                        activated: on,
                    })
                }]
            })
        }

        return {
            emotion_on: on,
        }
    }


    createOrUpdateChallengingReport = async ({ game_id, rating, comment}: any, user: DecodedIdToken) => {
        return await dbs.GameChallengingReport.getTransaction(async (transaction: Transaction) => {
            let report = await dbs.GameChallengingReport.findOne({ user_uid: user.uid, game_id }, transaction);
            if ( report ) {
                report.rating = rating;
                report.comment = comment;
                await report.save({ transaction });
            }
            else {
                report = await dbs.GameChallengingReport.create({ user_uid: user.uid, game_id, rating, comment }, transaction);
            }
        });
    }

    getReports = async ({ game_id, limit = 50, offset = 0 }: any, user: DecodedIdToken) => {
        const reports = await dbs.GameChallengingReport.findAll({ game_id }, {
            include: [{
                model: dbs.User.model,
            }],
            order: [['id', 'asc']],
            limit,
            offset,
        });

        return {
            reports: _.map(reports, (report: any) => {
                return {
                    rating: report.rating,
                    comment: report.comment,
                    user: {
                        uid: report.user.uid,
                        name: report.user.name,
                        picture: report.user.picture,
                    }
                }
            })
        }
    }
}


export default new GameContentController()
