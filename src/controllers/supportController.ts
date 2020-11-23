import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { dbs } from '../commons/globals';


interface IQnaParams {
    category: number
    title: string
    text: string
}

class SupportController {
    async askInquiry ({ category, title, text }: IQnaParams, { uid }: DecodedIdToken) {
        if ( !title || title.length < 1 ) {
            throw CreateError(ErrorCodes.INVALID_QNA_PARAMS)
        }
        if ( !text || text.length < 5 ) {
            throw CreateError(ErrorCodes.INVALID_QNA_PARAMS)
        }

        const user = await dbs.User.findOne({ uid });
        await dbs.UserInquiry.create({ user_id: user.id, category, title, text });
    }


    async getMyInquiries ({ limit = 50, offset = 0 }, { uid }: DecodedIdToken) {
        const user = await dbs.User.findOne({ uid });
        return await dbs.UserInquiry.getList({ user_id: user.id, limit, offset });
    }


    async getNotices () {}


    async getQna () {}

}


export default new SupportController()
