import { ISocialMedia, IUser } from './_interfaces';
import { dbs } from '../commons/globals';
import { Transaction } from 'sequelize';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import NotifyService from '../services/notifyService';
import { eNotify } from "../commons/enums";

class SocialMediaController {
    
    async follow({target_uid}: ISocialMedia, user: IUser) {
        return dbs.Follow.getTransaction(async (transaction: Transaction) => {
            const user_uid = user.uid;
            const record = await dbs.Follow.findOne({ where: {user_uid, target_uid}, transaction });
            if( record ) {
                throw CreateError(ErrorCodes.ALREADY_FOLLOWING_TARGET);
            }

            await dbs.Follow.create({user_uid, target_uid}, transaction);

            const profile = await dbs.Profile.findOne({user_uid}, transaction);
            profile.following_cnt += 1;
            await profile.save({transaction});

            const target = await dbs.Profile.findOne({user_uid: target_uid}, transaction);
            target.followers_cnt += 1;
            await target.save({transaction});

            await NotifyService.notify({user_uid, type: eNotify.Follow, extra: { target_uid }});
        });
    }
    
    
    async unfollow({target_uid}: ISocialMedia, user: IUser) {
        return dbs.Follow.getTransaction(async (transaction: Transaction) => {
            const user_uid = user.uid;
            const record = await dbs.Follow.findOne({ where: {user_uid, target_uid}, transaction });
            if( !record ) {
                throw CreateError(ErrorCodes.ALREADY_UNFOLLOW_TARGET);
            }

            await dbs.Follow.destroy({user_uid, target_uid}, transaction);

            const profile = await dbs.Profile.findOne({user_uid}, transaction);
            profile.following_cnt -= 1;
            await profile.save({transaction});

            const target = await dbs.Profile.findOne({user_uid: target_uid}, transaction);
            target.followers_cnt -= 1;
            await target.save({transaction});
        })
    }


    async following({user_uid}: ISocialMedia, user: IUser) {
        const records = await dbs.Follow.following({user_uid: user_uid || user.uid});
        return {
            following: records.map((record: any) => {
                return {
                    uid: record.target.uid,
                    displayName: record.target.display_name,
                    photoURL: record.target.photo_url
                }
            })
        }
    }

    async followers({user_uid}: ISocialMedia, user: IUser) {
        const records = await dbs.Follow.following({target_uid: user_uid || user.uid});
        return {
            followers: records.map((record: any) => {
                return {
                    uid: record.user.uid,
                    displayName: record.user.display_name,
                    photoURL: record.user.photo_url
                }
            })
        }
    }
}


export default new SocialMediaController()