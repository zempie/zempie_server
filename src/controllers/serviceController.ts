import { IAdmin } from './_interfaces';
import { dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;


interface IQnaParams {
    title: string
    content: string
}
interface IQnaAdminParams {
    user_id?: number
    limit?: number
    skip?: number
    question_id: number
    answer: string
}

class ServiceController {
    async askQuestion({ title, content }: IQnaParams, { uid }: DecodedIdToken) {
        if ( !title || title.length < 1 ) {
            throw CreateError(ErrorCodes.INVALID_QNA_PARAMS);
        }

        if ( content?.length ) {
            throw CreateError(ErrorCodes.INVALID_QNA_PARAMS);
        }

        const user = await dbs.User.findOne({ uid });
        await dbs.QnaQuestion.askQuestion({ user_id: user.id, title, content});
    }


    async getMyQuestionList({}, { uid }: DecodedIdToken) {
        const user = await dbs.User.findOne({ uid });
        const questions = await dbs.QnaQuestion.getList({ user_id: user.id });
        return {
            questions
        }
    }


    /**
     * 관리자
     */
    async getAllQuestionList({user_id, limit, skip}: IQnaAdminParams) {
        const questions = await dbs.QnaQuestion.findAll({ user_id }, {
            limit,
            skip,
        })
        return {
            questions,
        }
    }

    async answer({ question_id, answer }: IQnaAdminParams, { uid }: IAdmin) {
        const admin = await dbs.Admin.findOne({ uid });
        await dbs.QnaQuestion.update({ answer }, { id: question_id, admin: admin.name });
    }
}


export default new ServiceController()
