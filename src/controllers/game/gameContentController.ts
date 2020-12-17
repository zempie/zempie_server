import { dbs } from '../../commons/globals';
import { Transaction } from 'sequelize';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;


class GameContentController {
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
}


export default new GameContentController()
