import { IUser } from './_interfaces';
import { dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import * as _ from 'lodash';

class PublishingController {
    getList = async ({}, { uid }: IUser) => {
        const user = await dbs.User.getPublishing({ uid });
        if ( !user ) {
            throw CreateError(ErrorCodes.INVALID_USER_UID)
        }

        const { publishing } = user;
        return {
            publishing: _.map(publishing, (obj: any) => {
                const { game } = obj;
                return {
                    game_uid: game.uid,
                    title: game.title,
                    count_open: obj.count_open,
                }
            })
        }
    }
}


export default new PublishingController()
