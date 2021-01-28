import * as _ from 'lodash';
import { dbs } from '../../commons/globals';
import { Transaction } from 'sequelize';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { parseBoolean } from '../../commons/utils';
import MQ from '../../services/messageQueueService';


class GameContentController {
    heart = async ({ game_id, heart }: any, user: DecodedIdToken) => {
        const user_uid = user.uid;
        return await dbs.GameHeart.getTransaction(async (transaction: Transaction) => {
            const game = await dbs.Game.findOne({ id: game_id });
            if ( !game ) {
                throw CreateError(ErrorCodes.INVALID_GAME_ID);
            }

            let gameHeart = await dbs.GameHeart.findOne({ game_id, user_uid }, transaction);
            if ( !gameHeart ) {
                gameHeart = await dbs.GameHeart.create({ game_id, user_uid }, transaction);
            }
            gameHeart.activated = parseBoolean(heart);
            await gameHeart.save({ transaction });

            MQ.send({
                topic: 'gameHeart',
                messages: [{
                    value: JSON.stringify({
                        user_uid,
                        game_id,
                        activated: gameHeart.activated,
                    })
                }]
            })

            return {
                gameHeart: gameHeart.activated
            }
        })
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
