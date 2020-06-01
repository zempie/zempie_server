import * as _ from 'lodash';
import { IUser } from './_interfaces';
import { dbs, caches } from '../commons/globals';
import admin from 'firebase-admin';
import { Transaction, Op } from 'sequelize';
import FileManager from '../services/fileManager';
const replaceExt = require('replace-ext');
import { gameCache } from '../database/redis/models/games';
import Opt from '../../config/opt'
import { CreateError, ErrorCodes } from '../commons/errorCodes';
const { Url, Deploy } = Opt;

class UserController {
    /**
     * 사용자 정보 가져오기
     * - 정보가 없을 경우 firebase 에서 가져와서 저장
     */
    getInfo = async ({registration_token}: any, {uid}: IUser) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            let profile, setting;
            let user = await dbs.User.getInfo({uid}, transaction);
            if ( !user ) {
                user = await admin.auth().getUser(uid);
                if ( user ) {
                    user = await dbs.User.create({
                        uid,
                        display_name: user.displayName,
                        photo_url: user.photoURL,
                        provider_id: user.providerData[0].providerId,
                        email: user.email,
                        email_verified: user.emailVerified,
                        fcm_token: registration_token,
                    }, transaction);

                    profile = await dbs.UserProfile.create({ user_uid: user.uid }, transaction);
                    setting = await dbs.UserSetting.create({ user_uid: user.uid }, transaction);

                    // following 에 자신 추가 - 나중을 위해...
                    await dbs.Follow.create({ user_uid: uid, target_uid: uid }, transaction);
                }
            }
            else {
                if ( registration_token ) {
                    await admin.messaging().subscribeToTopic(registration_token, 'test-topic');
                    user.fcm_token = registration_token;
                    await user.save({transaction});
                }
            }

            const udi = await this.getUserDetailInfo(user, profile, setting);
            return {
                user: udi,
            }
        });
    }


    getTargetInfo = async ({target_uid}: any, {uid}: IUser) => {
        const user = await dbs.User.getProfile({uid: target_uid});
        const target = await this.getUserDetailInfo(user);
        return {
            target,
        }
    }


    private getUserDetailInfo = async (user: any, profile?: any, setting?: any) => {
        profile = profile || user.profile;
        setting = setting || user.setting;

        const _games = await gameCache.get();
        const game_records = _.map(user.gameRecords, (gr: any) => {
            const game = _.find(_games, (game: any) => {
                return game.game_uid === gr.game_uid
            });
            return {
                game_uid: game.game_uid,
                title: game.title,
                url_thumb: game.url_thumb,
                score: gr.score,
            }
        });

        return {
            uid: user.uid,
            displayName: user.display_name,
            photoURL: user.photo_url,
            level: profile.level,
            exp: profile.exp,
            state_msg: profile.state_msg,
            following_cnt: profile.following_cnt,
            followers_cnt: profile.followers_cnt,
            setting: setting? {
                theme: setting.app_theme,
                theme_extra: setting.app_theme_extra,
                language: setting.app_language,
                alarm: setting.notify_alarm,
                battle: setting.notify_battle,
                beat: setting.notify_beat,
                follow: setting.notify_follow,
                like: setting.notify_like,
                reply: setting.notify_reply,
            } : undefined,
            game_records,
        }
    }


    setInfo = async (params: any, {uid}: IUser, {file}: any) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({ uid }, transaction);
            if ( !user ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            // 이름 변경
            if ( params.display_name ) {
                // 이름 검사 해야함 - 불량 단어
                user.display_name = params.display_name;
            }

            // 상태 메시지 변경
            if ( params.state_msg ) {
                const profile = await dbs.UserProfile.findOne({ user_uid: uid }, transaction);
                if ( profile ) {
                    profile.state_msg = params.state_msg;
                    await profile.save({ transaction });
                }
            }

            if ( file ) {
                const webp = await FileManager.convertToWebp(file, 80);
                const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                // const data: any = await FileManager.s3upload(file.name, file.path, uid);
                user.photo_url = data.Location;
            }

            await user.save({ transaction });
        })
    }


    signOut = async ({}, {uid}: IUser) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({uid}, transaction);
            await admin.messaging().unsubscribeFromTopic(user.fcm_token, 'test-topic');
            user.fcm_token = null;
            await user.save({transaction});
        })
    }


    updateSetting = async (params: any, {uid}: IUser) => {
        return dbs.UserSetting.getTransaction(async (transaction: Transaction) => {
            const setting = await dbs.UserSetting.findOne({user_uid: uid}, transaction);

            if ( params.theme )  setting.app_theme = params.theme;
            if ( params.theme_extra) setting.app_theme_extra = params.theme_extra;
            if ( params.lang )   setting.app_language = params.lang;
            if ( params.alarm )  setting.notify_alarm = params.alarm;
            if ( params.battle ) setting.notify_battle = params.battle;
            if ( params.beat )   setting.notify.beat = params.beat;
            if ( params.follow ) setting.notify_follow = params.follow;
            if ( params.like )   setting.notify_like = params.like;
            if ( params.reply )  setting.notify_reply = params.reply;

            await setting.save({transaction});
        });
    }


    searchUser = async ({ search_name, limit = 100, offset = 0 }: any, {uid}: IUser) => {
        const users = await dbs.User.search({ search_name, limit, offset });
        return {
            users: _.map(users, (user: any) => {
                return {
                    uid: user.uid,
                    display_name: user.display_name,
                    photo_url: user.photo_url,
                }
            })
        }
    }


}


export default new UserController()