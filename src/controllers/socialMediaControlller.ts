import { ISocialMedia, IUser } from './_interfaces';
import { dbs } from '../commons/globals';
import { Transaction } from 'sequelize';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import NotifyService from '../services/notifyService';
import { eAlarm, eNotify } from '../commons/enums';

class SocialMediaController {
    
    async follow({target_uid}: ISocialMedia, user: IUser) {
        return dbs.Follow.getTransaction(async (transaction: Transaction) => {
            const user_uid = user.uid;
            if ( user_uid === target_uid ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            const record = await dbs.Follow.findOne({user_uid, target_uid}, transaction);
            if ( record ) {
                throw CreateError(ErrorCodes.ALREADY_FOLLOWING_TARGET);
            }

            await dbs.Follow.create({user_uid, target_uid}, transaction);

            const profile = await dbs.UserProfile.findOne({user_uid}, transaction);
            profile.following_cnt += 1;
            await profile.save({transaction});

            const target = await dbs.UserProfile.findOne({user_uid: target_uid}, transaction);
            target.followers_cnt += 1;
            await target.save({transaction});

            await dbs.Alarm.create({user_uid: target_uid, target_uid: user_uid, type: eAlarm.Follow, extra: { target_uid }}, transaction);
            await NotifyService.notify({user_uid: target_uid, type: eNotify.Follow, data: { target_uid }});
        });
    }
    
    
    async unfollow({target_uid}: ISocialMedia, user: IUser) {
        return dbs.Follow.getTransaction(async (transaction: Transaction) => {
            const user_uid = user.uid;
            if ( user_uid === target_uid ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            const record = await dbs.Follow.findOne({user_uid, target_uid}, transaction);
            if ( !record ) {
                throw CreateError(ErrorCodes.ALREADY_UNFOLLOW_TARGET);
            }

            await dbs.Follow.destroy({user_uid, target_uid}, transaction);

            const profile = await dbs.UserProfile.findOne({user_uid}, transaction);
            profile.following_cnt -= 1;
            await profile.save({transaction});

            const target = await dbs.UserProfile.findOne({user_uid: target_uid}, transaction);
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
        const records = await dbs.Follow.followers({user_uid: user_uid || user.uid});
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