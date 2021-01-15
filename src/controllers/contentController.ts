import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { dbs } from '../commons/globals';
import { eReportType } from '../commons/enums';
import { CreateError, ErrorCodes } from '../commons/errorCodes';


interface IReportParams {
    target_type: number,
    target_id: number,
    reason_num: number,
    reason: string,
}
class ContentController {
    reportGame = async ({target_type, target_id, reason_num, reason}: IReportParams, user: DecodedIdToken) => {
        if ( !target_id || !reason_num ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        const userRecord = await dbs.User.findOne({ uid: user.uid });
        await dbs.UserReport.create({
            user_id: userRecord.id,
            target_type: eReportType.Game,
            target_id,
            reason_num,
            reason,
        })

    }

    reportUser = async ({target_type, target_id, reason_num, reason}: IReportParams, user: DecodedIdToken) => {
        if ( !target_id || !reason_num ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        const userRecord = await dbs.User.findOne({ uid: user.uid });
        await dbs.UserReport.create({
            user_id: userRecord.id,
            target_type: eReportType.User,
            target_id,
            reason_num,
            reason,
        })

    }
}


export default new ContentController()
