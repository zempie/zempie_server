import { dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { INotifyParams } from '../controllers/_interfaces';
import { eNotify } from '../commons/enums';
import admin from 'firebase-admin';

class NotifyService {

    async notify({user_uid, type, extra}: INotifyParams) {
        const user = await dbs.User.getSetting({uid: user_uid});
        if ( !user ) {
            throw CreateError(ErrorCodes.INVALID_USER_UID);
        }
        if ( !user.fcm_token ) {
             // throw CreateError(ErrorCodes.INVALID_FCM_TOKEN);
            return;
        }

        if ( user.notify[type] ) {
            // const data = JSON.stringify(extra);
            await this.sendMessage(user.fcm_token, type, extra);
        }
    }


    async sendMessage(token: string, type: eNotify, data: any) {
        try {
            await admin.messaging().send({
                token,
                notification: {
                    title: 'notification-title',
                    body: 'notification-body',
                    imageUrl: 'https://zemini.s3.ap-northeast-2.amazonaws.com/companies/FTR_Symbol.png'
                },
                fcmOptions: {
                    analyticsLabel: ''
                },
                data: {
                    type: type.toString(),
                    ...data
                }
            });
        }
        catch ( e ) {
            console.error(e);
        }
    }
}


export default new NotifyService()