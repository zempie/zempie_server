import { IUser } from './_interfaces';
import { dbs } from '../commons/globals';
import admin from 'firebase-admin';
import { Transaction } from 'sequelize';

class UserController {
    /**
     * 사용자 정보 가져오기
     * - 정보가 없을 경우 firebase 에서 가져와서 저장
     */
    async getInfo({registration_token}: any, {uid}: IUser) {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            let profile, setting;
            let user = await dbs.User.getInfo({uid}, transaction);
            if( !user ) {
                user = await admin.auth().getUser(uid);
                if( user ) {
                    user = await dbs.User.create({
                        uid,
                        display_name: user.displayName,
                        photo_url: user.photoURL,
                        provider_id: user.providerData[0].providerId,
                        email: user.email,
                        email_verified: user.emailVerified,
                        fcm_token: registration_token,
                    }, transaction);

                    profile = await dbs.Profile.create({ user_uid: user.uid }, transaction);
                    setting = await dbs.UserSetting.create({ user_uid: user.uid }, transaction);
                }
            }
            else {
                if( registration_token ) {
                    user.fcm_token = registration_token;
                    await user.save({transaction});
                }
            }

            profile = profile || user.profile;
            setting = setting || user.setting;

            return {
                uid,
                displayName: user.display_name,
                photoURL: user.photo_url,
                level: profile.level,
                exp: profile.exp,
                following_cnt: profile.following_cnt,
                followers_cnt: profile.followers_cnt,
                setting: {
                    notice: setting.notice
                },
            }
        });
    }


    async getTargetInfo({target_uid}: any, {uid}: IUser) {
        const user = await dbs.User.getProfile({uid: target_uid});
        const profile = user.profile;

        return {
            uid: target_uid,
            displayName: user.display_name,
            photoURL: user.photo_url,
            level: profile.level,
            exp: profile.exp,
            following_cnt: profile.following_cnt,
            followers_cnt: profile.followers_cnt
        }
    }


    async signOut({}, {uid}: IUser) {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({uid}, transaction);
            user.fcm_token = null;
            await user.save({transaction});
        })
    }


    async updateSetting(params: any, {uid}: IUser) {
        return dbs.UserSetting.getTransaction(async (transaction: Transaction) => {
            const setting = await dbs.UserSetting.findOne({uid}, transaction);

            // 변경 사항 반영

            await setting.save({transaction});
        });
    }
}


export default new UserController()