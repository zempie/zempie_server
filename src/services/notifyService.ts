import { dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { INotifyParams } from '../controllers/_interfaces';
import { eNotify } from '../commons/enums';

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

        if ( user.setting.notify[type] ) {
            const msg = JSON.stringify(extra);
            this.sendMessage({user_uid, msg});
        }
    }


    sendMessage({user_uid, msg}: any) {

    }
}


export default new NotifyService()