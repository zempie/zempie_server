import * as _ from 'lodash';
import { IRoute, IZempieClaims } from './_interfaces';
import { dbs, caches } from '../commons/globals';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { Transaction, Op } from 'sequelize';
import FileManager from '../services/fileManager';
const replaceExt = require('replace-ext');
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import Opt from '../../config/opt';
const { Url } = Opt;


class UserController {
    signUp = async ({ name, registration_token }: any, _user: DecodedIdToken) => {
        const record = await dbs.User.findOne({ uid: _user.uid });
        if ( record ) {
            throw CreateError(ErrorCodes.INVALID_USER_UID);
        }

        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.create({
                uid: _user.uid,
                name: name || _user.name,
                channel_id: _user.uid,
                picture: _user.picture,
                provider: _user.firebase.sign_in_provider,
                email: _user.email,
                email_verified: _user.email_verified,
                fcm_token: registration_token,
            }, transaction);

            const user_id = user.id;
            const profile = await dbs.UserProfile.create({ user_id }, transaction);
            const setting = await dbs.UserSetting.create({ user_id }, transaction);

            // following 에 자신 추가 - 나중을 위해...
            await dbs.Follow.create({ user_uid: _user.uid, target_uid: _user.uid }, transaction);

            const udi = await this.getUserDetailInfo(user, profile, setting);
            return {
                user: {
                    ...udi,
                    email: user.email,
                    email_verified: user.email_verified,
                },
            }
        })
    }
    /**
     * 사용자 정보 가져오기
     * - 정보가 없을 경우 firebase 에서 가져와서 저장
     */
    getInfo = async ({registration_token}: any, _user: DecodedIdToken) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const { uid } = _user;
            let user = await dbs.User.getInfo({uid}, transaction);
            if ( !user ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            if ( registration_token ) {
                await admin.messaging().subscribeToTopic(registration_token, 'test-topic');
                user.fcm_token = registration_token;
                await user.save({transaction});
            }

            const udi = await this.getUserDetailInfo(user);
            return {
                user: {
                    ...udi,
                    email: user.email,
                    email_verified: user.email_verified,
                },
            }
        });
    }


    getTargetInfoByUid = async ({target_uid}: any, {uid}: DecodedIdToken) => {
        const user = await dbs.User.getProfileByUid({ uid: target_uid });
        const target = await this.getUserDetailInfo(user);
        return {
            target,
        }
    }


    getTargetInfoByChannelId = async ({channel_id}: {channel_id: string}, _: DecodedIdToken) => {
        const user = await dbs.User.getProfileByChannelId({ channel_id });
        if ( !user ) {
            throw CreateError(ErrorCodes.INVALID_CHANNEL_ID);
        }
        const target = await this.getUserDetailInfo(user);
        return {
            target,
        }
    }


    private getUserDetailInfo = async (user: any, profile?: any, setting?: any) => {
        profile = profile || user.profile;
        setting = setting || user.setting;

        // todo: 나중에 읽는 횟수 줄여야함
        // const game_records = _.map(user.gameRecords, (gr: any) => {
        //     const game = gr.game;
        //     return {
        //         game_uid: game.uid,
        //         title: game.title,
        //         url_thumb: game.url_thumb,
        //         score: gr.score,
        //     }
        // });

        return {
            uid: user.uid,
            name: user.name,
            channel_id: user.channel_id,
            picture: user.picture,
            is_developer: user.is_developer,
            profile: {
                level: profile.level,
                exp: profile.exp,
                following_cnt: profile.following_cnt,
                followers_cnt: profile.followers_cnt,
                state_msg: profile.state_msg,
                description: profile.description,
                url_banner: profile.url_banner,
            },
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
            dev_games: user.is_developer? _.map(user.devGames, (game: any) => {
                return {
                    game_uid: game.uid,
                    official: game.official,
                    title: game.title,
                    pathname: game.pathname,
                    version: game.version,
                    control_type: game.control_type,
                    hashtags: game.hashtags,
                    count_over: game.count_over,
                    url_game: game.url_game,
                    url_thumb: game.url_thumb,
                    share_url: user? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
                }
            }) : undefined,
            game_records: user.game_records? _.map(user.gameRecords, (gr: any) => {
                const game = gr.game;
                return {
                    game_uid: game.uid,
                    title: game.title,
                    url_thumb: game.url_thumb,
                    score: gr.score,
                }
            }) : undefined,
        }
    }


    async verifyEmail ({}, user: DecodedIdToken) {
        if ( user.email_verified ) {
            throw CreateError(ErrorCodes.USER_ALREADY_VERIFIED_EMAIL);
        }

        const userRecord = await admin.auth().getUser(user.uid)
        if ( !userRecord.emailVerified ) {
            throw CreateError(ErrorCodes.USER_INVALID_VERIFIED_EMAIL);
        }

        await admin.auth().updateUser(user.uid, {
            emailVerified: true,
        });
        await dbs.User.update({ email_verified: true }, { uid: user.uid });
    }


    async verifyChannelId ({ channel_id }: { channel_id: string }, user: DecodedIdToken) {
        // 규칙 확인

        // if ok
        const dup = await dbs.User.findOne({ channel_id });
        if ( dup ) {
            throw CreateError(ErrorCodes.USER_DUPLICATED_CHANNEL_ID);
        }

        // await dbs.User.update({ channel_id }, { uid: user.uid });
    }


    setInfo = async (params: any, {uid}: DecodedIdToken, {req: {files: {file}}}: IRoute) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({ uid }, transaction);
            if ( !user ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            if ( params.channel_id ) {
                user.channel_id = params.channel_id;
            }

            // 이름 변경
            if ( params.name ) {
                // 이름 검사 해야함 - 불량 단어
                user.name = params.name;
            }

            // 상태 메시지 변경
            if ( params.state_msg ) {
                const profile = await dbs.UserProfile.findOne({ user_id: user.id }, transaction);
                if ( profile ) {
                    profile.state_msg = params.state_msg;
                    await profile.save({ transaction });
                }
            }

            let data: any;
            if ( file ) {
                const webp = await FileManager.convertToWebp(file, 80);
                data = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                // const data: any = await FileManager.s3upload(file.name, file.path, uid);
                user.picture = data.Location;
            }

            if ( params.name || data ) {
                await admin.auth().updateUser(uid, {
                    displayName: params.name? params.name : undefined,
                    photoURL: data? data.Location : undefined,
                })
            }

            await user.save({ transaction });
        })
    }


    setBanner = async ({}, { uid }: DecodedIdToken, {req: {files: {file}}}: IRoute) => {
        if ( !file ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS)
        }
        const user = await dbs.User.findOne({ uid });
        const webp = await FileManager.convertToWebp(file, 80);
        const data: any = await FileManager.s3upload('banner.webp', webp[0].destinationPath, uid);
        await dbs.UserProfile.update({ url_banner: data.Location }, { user_id: user.id })
        return {
            url_banner: data.Location
        }
    }


    signOut = async ({}, {uid}: DecodedIdToken) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({uid}, transaction);
            await admin.messaging().unsubscribeFromTopic(user.fcm_token, 'test-topic');
            user.fcm_token = null;
            await user.save({transaction});
        })
    }


    updateSetting = async (params: any, {uid}: DecodedIdToken) => {
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


    updateExternalLink = async (params: any, { uid }: DecodedIdToken) => {

    }


    deleteExternalLink = async ({ id }: { id: number}, { uid }: DecodedIdToken) => {
        const user = await dbs.User.findOne({ uid });
        await dbs.UserExternalLink.destroy({ user_id: user.id, id })
    }




    searchUser = async ({ search_name, limit = 100, offset = 0 }: any, {uid}: DecodedIdToken) => {
        const users = await dbs.User.search({ search_name, limit, offset });
        return {
            users: _.map(users, (user: any) => {
                return {
                    uid: user.uid,
                    name: user.name,
                    picture: user.picture,
                }
            })
        }
    }


    leaveZempie = async ({ num, text }: { num: number, text: string }, { uid }: DecodedIdToken) => {
        await dbs.UserLeftLog.getTransaction(async (transaction: Transaction) => {
            await dbs.UserLeftLog.create({
                user_uid: uid,
                reason_num: num,
                reason_text: text,
            }, transaction)
            await dbs.User.destroy({ uid }, transaction);
        })
    }
}


export default new UserController()
