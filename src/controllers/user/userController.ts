import * as _ from 'lodash';
import * as cookie from 'cookie';
import * as urlencode from 'urlencode';
import { Request, Response } from 'express';
import { IRoute, IZempieClaims } from '../_interfaces';
import { dbs, caches, docs } from '../../commons/globals';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { Transaction, Op } from 'sequelize';
import FileManager from '../../services/fileManager';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { getGameData } from '../_common';
import { isOK_channelID } from '../../commons/utils';
// import { ClientSession } from 'mongoose';
import Opt from '../../../config/opt';
import { eNotificationType } from '../../commons/enums';
import { decode } from 'jsonwebtoken';
const { Url, CORS } = Opt;
const replaceExt = require('replace-ext');


class UserController {
    getCustomToken = async (_: any, __: any, { req, res }: any) => {
        if (!req.headers.cookie) {
            throw CreateError(ErrorCodes.INVALID_SESSION)
        }

        if (req.headers.origin && CORS.allowedOrigin.includes(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            const { _Zid: uid } = cookie.parse(req.headers.cookie);
            const customToken = await admin.auth().createCustomToken(uid);
            return {
                customToken,
            }
        }
    }
    setCookie = async (_: any, user: DecodedIdToken, { req, res }: any) => {
        if (req.headers.origin && CORS.allowedOrigin.includes(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Headers', 'Authorization');
            res.setHeader('Set-Cookie', cookie.serialize('_Zc', user.uid, {
                domain: CORS.domain,
                path: '/',
                maxAge: 60 * 60 * 24,
                // httpOnly: true,
                secure: CORS.secure,
            }));
        }
    }


    signUp = async ({ name, nickname, registration_token }: any, _user: DecodedIdToken, { req, res }: any) => {
        const record = await dbs.User.findOne({ uid: _user.uid });
        if (record) {
            throw CreateError(ErrorCodes.INVALID_USER_UID);
        }

        return dbs.User.getTransaction(async (transaction: Transaction) => {
            if (!await dbs.ForbiddenWords.isOk(name || _user.name)) {
                throw CreateError(ErrorCodes.FORBIDDEN_STRING);
            }
            // else if ( !await dbs.ForbiddenWords.isOk(nickname) ) {
            //     throw CreateError(ErrorCodes.FORBIDDEN_STRING);
            // }
            
            //임시 닉네임
            let tempNickname = ''
            if(_user.email){
               const [emailId] =_user.email.split('@')    
               tempNickname = emailId
            }

            const user = await dbs.User.create({
                uid: _user.uid,
                name: name || _user.name,
                nickname: nickname || tempNickname,
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
            const coin = await dbs.UserCoin.create({ user_id }, transaction);

            // following 에 자신 추가 - 나중을 위해...
            // await dbs.Follow.create({ user_uid: _user.uid, target_uid: _user.uid }, transaction);

            await this.setCookie(null, _user, { req, res });

            const udi = await this.getUserDetailInfo(user, profile, setting, coin);
            return {
                user: {
                    ...udi,
                    email: user.email,
                    email_verified: user.email_verified,
                },
            }
        })
    }


    getInfo = async ({ registration_token }: any, _user: DecodedIdToken, { req, res }: any) => {
        const { uid } = _user;
        
        let user = await caches.user.getInfo(uid);
        if (!user) {
            const userRecord = await dbs.User.getInfo({ uid });
            if (!userRecord) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            await this.setCookie(null, _user, { req, res });

            

            const udi = await this.getUserDetailInfo(userRecord);
            user = {
                ...udi,
                email: userRecord.email,
                email_verified: userRecord.email_verified,
            };

            const userMeta =  await dbs.UserMeta.findOne({user_id:user.id})
            let newCount = 0
            
            if( userMeta ){
                const { notification_check_time } = userMeta
                user.meta = {
                    unread_noti_count : await dbs.Notification.count(notification_check_time, new Date())
                }
            }
            
            userRecord.mata = {
                unread_noti_count: newCount           
            }
            userRecord.last_log_in = new Date();
            userRecord.save();

           
            caches.user.setInfo(uid, user);
        }

        const userBan = await dbs.UserBan.getUserBan({ user_id: user.id })

        if (userBan) {
            return user = {
                user: {
                    ...user,
                    ban: {
                        reason: userBan.reason,
                        period: userBan.period
                    }
            }};
        }
        return {
            user
        }
    }


    getTargetInfoByUid = async ({ target_uid }: any, _user: DecodedIdToken) => {
        const user = await dbs.User.getProfileByUid({ uid: target_uid });

        const target = await this.getUserDetailInfo(user);
        return {
            target,
        }
    }

    getTargetInfoById = async ({ user_id }: any, _user: DecodedIdToken) => {
        const user = await dbs.User.getProfileByUserID({ user_id });

        const target = await this.getUserDetailInfo(user);
        
        return {
            target,
        }
    }


    getTargetInfoByChannelId = async ({ channel_id }: { channel_id: string }, _user: DecodedIdToken) => {
        let channel = await caches.user.getChannel(channel_id);

        if (!channel) {
            // const user = await docs.User.getProfile({ channel_id });
            // if ( user ) {
            //     channel = await this.getUserDetailInfo(user);
            // }
            const channelInfo = await dbs.User.getProfileByChannelId({ channel_id });

            if (!channelInfo) {
                throw CreateError(ErrorCodes.INVALID_CHANNEL_ID);
            }

            const postCount = await dbs.Post.findAndCountAll({ user_id: channelInfo.id })
            channelInfo.post_cnt = postCount.count

            channel = await this.getUserDetailInfo(channelInfo)

            if(_user){
                const followStatus = _user ? await dbs.Follow.followStatus(_user.uid, channelInfo.id) : null;
                const isFollowing = followStatus ? true : false;
                channel.is_following = isFollowing

                const user = await dbs.User.findOne({uid: _user.uid})
                const is_blocked = await dbs.Block.findOne({target_id:channel.id, user_id: user.id})
                channel.is_blocked = is_blocked ? true : false

            }
            // caches.user.setChannel(channel_id, channel);
        }
        return {
            target: channel
        }
    }
    getTargetInfoByNickname = async ({nickname} : {nickname: string}, _user:DecodedIdToken) => {
        const channelInfo = await dbs.User.getChannelIdByNickname(nickname)
   
        return this.getTargetInfoByChannelId(channelInfo, _user)
    }


    updateAlarmStatus = async ({alarm_state, type}: {alarm_state: boolean, type: eNotificationType}, {uid}: DecodedIdToken) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({ uid }, transaction);
            if (!user) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            let targetCol
            switch(type){
                case eNotificationType.Dm:
                    targetCol = 'notify_chat'
                    break;
                default:
                    targetCol = 'notify_alarm'
            }

            await dbs.UserSetting.update({[targetCol] : alarm_state}, { user_id: user.id})
            
            user.setting[targetCol] = alarm_state
            await user.save({ transaction });

            caches.user.delInfo(uid);
            
            return { user_setting: user.setting }

        })

    }

    private getUserDetailInfo = async (user: any, profile?: any, setting?: any, coin?: any) => {
        profile = profile || user.profile;
        setting = setting || user.setting;
        coin = coin || user.coin;

        const followingCnt = await dbs.Follow.followingCnt(user.id)
        const followerCnt = await dbs.Follow.followerCnt(user.id)

        return {
            id: user.id,
            uid: user.uid,
            name: user.name,
            nickname: user.nickname,
            channel_id: user.channel_id,
            email: user.email,
            picture: user.picture,
            url_banner: user.url_banner,
            is_developer: user.is_developer,
            id_verified: user.id_verified,
            following_cnt: followingCnt,
            follower_cnt: followerCnt,
            post_cnt: user.post_cnt,
            projects: user.projects,
            meta: {
                unread_noti_count: user.unread_noti_count,
                unread_dm_count: user.unread_dm_count
            },
            profile: {
                level: profile.level,
                exp: profile.exp,
                state_msg: profile.state_msg,
                description: profile.description,
                url_banner: profile.url_banner,
            },
            setting: setting ? {
                theme: setting.app_theme,
                theme_extra: setting.app_theme_extra,
                language: setting.app_language,
                alarm: setting.notify_alarm,
                dm_alarm: setting.notify_chat,
                battle: setting.notify_battle,
                beat: setting.notify_beat,
                // follow: setting.notify_follow,
                like: setting.notify_like,
                reply: setting.notify_reply,
            } : undefined,
            coin: coin ? {
                zem: coin.zem,
                pie: coin.pie
            } : undefined,
            games: _.map(user.devGames, (game: any) => {
                return {
                    activated: game.activated,
                    ...getGameData(game),
                }
            }),
            dev_games: user.is_developer ? _.map(user.devGames, (game: any) => {
                return {
                    activated: game.activated,
                    ...getGameData(game),
                }
            }) : undefined,
            game_records: user.game_records ? _.map(user.game_records, (gr: any) => {
                const game = gr.game;
                return {
                    game_id: game.id,
                    title: game.title,
                    url_thumb: game.url_thumb,
                    score: gr.score,
                }
            }) : undefined,
        }
    }


    async verifyEmail({ }, user: DecodedIdToken) {
        const userRecord = await admin.auth().getUser(user.uid)
        if (userRecord.emailVerified) {
            await admin.auth().updateUser(user.uid, {
                emailVerified: true,
            });
            await dbs.User.update({ email_verified: true }, { uid: user.uid });
        }
    }


    async verifyChannelId({ channel_id }: { channel_id: string }, user: DecodedIdToken) {
        // 규칙 확인
        if (!isOK_channelID(channel_id)) {
            throw CreateError(ErrorCodes.INVALID_CHANNEL_ID);
        }

        // if ok
        const encoded = urlencode(channel_id)
        const dup = await dbs.User.findOne({ channel_id: encoded });
        if (dup) {
            throw CreateError(ErrorCodes.USER_DUPLICATED_CHANNEL_ID);
        }

        // await dbs.User.update({ channel_id }, { uid: user.uid });
    }


    setInfo = async (params: any, { uid }: DecodedIdToken, { req: { files: { file, banner_file }  } }: IRoute) => {
        // 불량 단어 색출
        if (!dbs.BadWords.areOk(params)) {
            throw CreateError(ErrorCodes.FORBIDDEN_STRING);
        }

        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({ uid }, transaction);
            if (!user) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            const updateRequest: any = {};

            if (user.channel_id !== params.channel_id && params.channel_id) {
                // 규칙 확인
                if (!isOK_channelID(params.channel_id)) {
                    throw CreateError(ErrorCodes.INVALID_CHANNEL_ID);
                }
                user.channel_id = urlencode(params.channel_id);
            }

            if (params.registration_token) {
                await admin.messaging().subscribeToTopic(params.registration_token, 'broadcast-topic');
                user.fcm_token = params.registration_token;
            }

            // 이름 변경
            if (params.name) {
                if (!await dbs.ForbiddenWords.isOk(params.name)) {
                    throw CreateError(ErrorCodes.FORBIDDEN_STRING);
                }
                user.name = params.name;
                updateRequest.displayName = params.name;
            }

            // 닉네임 변경
            if(params.nickname){
                if (!await dbs.ForbiddenWords.isOk(params.name)) {
                    throw CreateError(ErrorCodes.FORBIDDEN_STRING);
                }
                user.nickname = params.nickname
            }

            let profile;
            // 상태 메시지 변경
            if (params.state_msg) {
                profile = await dbs.UserProfile.findOne({ user_id: user.id }, transaction);
                profile.state_msg = params.state_msg;
            }

            // 채널 설명
            if (params.description) {
                profile = profile || await dbs.UserProfile.findOne({ user_id: user.id }, transaction);
                profile.description = params.description;
            }

            if (profile) {
                await profile.save({ transaction });
            }

            let data: any;
            // 프로필 사진
            if (file) {
                const webp = await FileManager.convertToWebp(file, 80);
                // data = await FileManager.s3upload(replaceExt(/*file.name*/'profile', '.webp'), webp[0].destinationPath, uid);
                // const data: any = await FileManager.s3upload(file.name, file.path, uid);
                data = await FileManager.s3upload({
                    bucket: Opt.AWS.Bucket.Rsc,
                    key: replaceExt('profile', '.webp'),
                    filePath: webp[0].destinationPath,
                    uid,
                    subDir: '/profile',
                });

                user.picture = data.Location;
                updateRequest.photoURL = data.Location;
            }
            else if (params.rm_picture) {
                user.picture = null;
                updateRequest.photoURL = null;
            }

            if (banner_file) {
                const webp = await FileManager.convertToWebp(banner_file, 80);

                data = await FileManager.s3upload({
                    bucket: Opt.AWS.Bucket.Rsc,
                    key: replaceExt('banner', '.webp'),
                    filePath: webp[0].destinationPath,
                    uid,
                    subDir: '/banner',
                });

                user.url_banner = data.Location;
                updateRequest.photoURL = data.Location;
            }

            else if (params.rm_banner) {
                user.url_banner = null;
                updateRequest.photoURL = null;
            }

            if (Object.keys(updateRequest).length > 0) {
                await admin.auth().updateUser(uid, updateRequest);
            }

            

            // if ( params.name || data ) {
            //     await admin.auth().updateUser(uid, {
            //         displayName: params.name? params.name : undefined,
            //         photoURL: data? data.Location : undefined,
            //     })
            // }

            await user.save({ transaction });

            caches.user.delInfo(uid);
            
            const userInfo =  await this.getUserDetailInfo(user, profile)
            return { user: userInfo }
        })
    }


    setBanner = async ({ }, { uid }: DecodedIdToken, { req: { files: { file } } }: IRoute) => {
        if (!file) {
            throw CreateError(ErrorCodes.INVALID_PARAMS)
        }
        const user = await dbs.User.findOne({ uid });
        const webp = await FileManager.convertToWebp(file, 80);
        // const data: any = await FileManager.s3upload('banner.webp', webp[0].destinationPath, uid);
        const data: any = await FileManager.s3upload({
            bucket: Opt.AWS.Bucket.Rsc,
            key: 'banner.webp',
            filePath: webp[0].destinationPath,
            uid,
            subDir: '/channel'
        });
        await dbs.UserProfile.update({ url_banner: data.Location }, { user_id: user.id })

        caches.user.delInfo(uid);

        return {
            url_banner: data.Location
        }
    }


    signOut = async (_: any, _user: DecodedIdToken, { req, res }: any) => {
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({ uid: _user.uid }, transaction);
            if (user.fcm_token) {
                await admin.messaging().unsubscribeFromTopic(user.fcm_token, 'test-topic');
                user.fcm_token = null;
                await user.save({ transaction });
            }

            if (req.headers.origin && CORS.allowedOrigin.includes(req.headers.origin)) {
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Set-Cookie', cookie.serialize('uid', '', {
                    domain: CORS.domain,
                    maxAge: 0,
                    httpOnly: true,
                    secure: CORS.secure,
                }));
            }
        })
    }


    updateSetting = async (params: any, { uid }: DecodedIdToken) => {
        return dbs.UserSetting.getTransaction(async (transaction: Transaction) => {
            const setting = await dbs.UserSetting.findOne({ user_uid: uid }, transaction);

            if (params.theme) setting.app_theme = params.theme;
            if (params.theme_extra) setting.app_theme_extra = params.theme_extra;
            if (params.lang) setting.app_language = params.lang;
            if (params.alarm) setting.notify_alarm = params.alarm;
            if (params.battle) setting.notify_battle = params.battle;
            if (params.beat) setting.notify.beat = params.beat;
            // if ( params.follow ) setting.notify_follow = params.follow;
            if (params.like) setting.notify_like = params.like;
            if (params.reply) setting.notify_reply = params.reply;
            if (params.notify_chat) setting.notify_chat = params.notify_chat;


            await setting.save({ transaction });
        });
    }


    updateExternalLink = async (params: any, { uid }: DecodedIdToken) => {

    }


    deleteExternalLink = async ({ id }: { id: number }, { uid }: DecodedIdToken) => {
        const user = await dbs.User.findOne({ uid });
        await dbs.UserExternalLink.destroy({ user_id: user.id, id })
    }



    filterBadWord = async ({ w }: { w: string }) => {
        // 불량 단어 색출
        if (!dbs.BadWords.isOk(w) || !await dbs.ForbiddenWords.isOk(w)) {
            throw CreateError(ErrorCodes.FORBIDDEN_STRING);
        }
    }



    searchUser = async ({ search_name, limit = 100, offset = 0 }: any, { uid }: DecodedIdToken) => {
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
        admin.auth().deleteUser(uid).then(async () => {
            await dbs.UserLeftLog.getTransaction(async (transaction: Transaction) => {
                await dbs.UserLeftLog.create({
                    user_uid: uid,
                    reason_num: num,
                    reason_text: text,
                }, transaction)
                await dbs.User.destroy({ uid }, transaction);
            })
        })
    }


    // testMongo = async () => {
    //     await docs.User2.getTransaction(async (session: ClientSession) => {
    //         await docs.Sample.create({
    //             name: 'wndhrl',
    //             text: 'wndhrdlajrdjdtjdkgksmsep'
    //         }, session);
    //         await docs.Sample2.create({
    //             name: 'gpfk',
    //             text: 'gpfkakswlrhtlvek'
    //         }, session);
    //         // const doc = await docs.Sample.findOne({name: 'wndhrl' }, { session });
    //         // doc.text = 'wndhrlEkajrj'
    //         // doc.save({ session });
    //     });
    // }


    testClaim = async (params: any, user: DecodedIdToken) => {
        // const claim = {
        //     zempie: {
        //         deny: {
        //             reply: {
        //                 state: true,
        //                 date: new Date(2021,0, 22),
        //                 count: 1,
        //             }
        //         }
        //     }
        // };
        //
        // if ( !user.zempie ) {
        //     await admin.auth().setCustomUserClaims(user.uid, claim);
        // }
        // else {
        //     console.log(JSON.stringify(claim))
        // }

        const userClaim = await dbs.UserClaim.findOne({ user_uid: user.uid });
        const claim: IZempieClaims = JSON.parse(userClaim.data);

        claim.zempie.deny['reply'] = {
            state: true,
            date: new Date(2021, 0, 23).getTime(),
            count: claim.zempie.deny['reply'].count + 1,
        };

        userClaim.data = claim;
        userClaim.save();

        admin.auth().setCustomUserClaims(userClaim.user_uid, claim);
    }

    hasEmail = async ({ email }: { email: string }) => {
        const hasEmail = await dbs.User.hasEmail(email);
        let success = true;

        if (!hasEmail) {
            success = false;

        }
        return success;

    }

    hasNickname = async ({ nickname }: { nickname: string }) => {
        const hasNickname =  await dbs.User.hasNickname(nickname);
        let success = true;

        if (!hasNickname) {
            success = false;
        }
        return {success: success};
    }

    registerBankAccount = async({ bank, account_num, name}: { bank: string, account_num: number, name:string }, {uid}: DecodedIdToken) => {
        //TODO: 계좌 개수 제한( 관리자 페이지랑 연동 )

        if(!bank || !account_num){
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        return await dbs.UserBankAccount.getTransaction(async (transaction: Transaction) => {

            const user = await dbs.User.getInfo({ uid }, transaction);
            
            if (!user) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }
            if( !user.id_verified ){
                throw CreateError(ErrorCodes.USER_INVALID_VERIFIED_ID);
            }

            const verifiedUserInfo = await dbs.VerifiedUser.findOne({ user_uid: user.uid })
            //TODO: 등록된 정보랑 새로 인증하는 정보랑 다르면 등록 안됨 

            const userBankAccounts = await dbs.UserBankAccount.findAll({
                user_uid: user.uid
            })
    
            if(userBankAccounts.length){
                userBankAccounts.forEach((account : any) => {
                    if(account.account_num === account_num && account.bank === bank){
                        throw CreateError(ErrorCodes.USER_DUPLICATED_BANK_ACCOUNT);
                    }
                })
            }

            return await dbs.UserBankAccount.create({
                user_uid: user.uid,
                bank,
                name,
                account_num
            }, transaction)

        })

    }

    deleteBankAccount = async({ bank_account_id }: { bank_account_id: number }, user: DecodedIdToken ) => {
        if(!bank_account_id){
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }
       return await dbs.UserBankAccount.getTransaction(async (transaction: Transaction) => {
            const account = await dbs.UserBankAccount.findOne({
                id: bank_account_id
            })
            
            if( !account ){
                throw CreateError(ErrorCodes.INVALID_PARAMS)
            }
    
            if(account.user_uid !== user.uid){
                throw CreateError(ErrorCodes.ACCESS_DENY);
            }

           return await dbs.UserBankAccount.destroy({
                id: bank_account_id,
                user_uid: user.uid
            }, transaction)
        })



    }

    getBankAccounts = async( _: any, user: DecodedIdToken ) => {

        return await dbs.UserBankAccount.findAll({
            user_uid: user.uid
        })
    }

    verifyIdentification = async(params: any, { uid }: DecodedIdToken) => {
        //TODO: 인증 api 붙여야됨

        if( !params.is_passed ){
            throw CreateError(ErrorCodes.USER_VERIFIED_ID_FAILURE);
        }
        
        
       return await dbs.User.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({ uid }, transaction);
                
            if ( !user ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }
            if( user.id_verified){
                throw CreateError(ErrorCodes.USER_ALREADY_VERIFIED_ID);
            }

            const verifiedUserInfo = await dbs.VerifiedUser.create({
                user_uid: uid,
                name: params.name,
                birth: params.birth,
                gender: params.gender,
                national_info: params.national_info,
                mobile_co: params.mobile_co,
                mobile_num: params.mobile_num
            })

            await dbs.User.update({ id_verified: true }, { uid }, transaction);
            caches.user.delInfo(uid);

            return verifiedUserInfo

        })
    }

}


export default new UserController()
