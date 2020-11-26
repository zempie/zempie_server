"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const cookie = require("cookie");
const globals_1 = require("../commons/globals");
const firebase_admin_1 = require("firebase-admin");
const fileManager_1 = require("../services/fileManager");
const replaceExt = require('replace-ext');
const errorCodes_1 = require("../commons/errorCodes");
const opt_1 = require("../../config/opt");
const { Url, CORS } = opt_1.default;
class UserController {
    constructor() {
        this.getCustomToken = (_, __, { req, res }) => __awaiter(this, void 0, void 0, function* () {
            if (!req.headers.cookie) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_SESSION);
            }
            if (req.headers.origin && CORS.allowedOrigin.includes(req.headers.origin)) {
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                const { _Zid: uid } = cookie.parse(req.headers.cookie);
                const customToken = yield firebase_admin_1.default.auth().createCustomToken(uid);
                return {
                    customToken,
                };
            }
        });
        this.setCookie = (_, user, { req, res }) => __awaiter(this, void 0, void 0, function* () {
            if (req.headers.origin && CORS.allowedOrigin.includes(req.headers.origin)) {
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Headers', 'Authorization');
                res.setHeader('Set-Cookie', cookie.serialize('_Zid', user.uid, {
                    domain: CORS.domain,
                    path: '/',
                    maxAge: 60 * 60,
                    httpOnly: true,
                    secure: CORS.secure,
                }));
            }
        });
        this.signUp = ({ name, registration_token }, _user, { req, res }) => __awaiter(this, void 0, void 0, function* () {
            const record = yield globals_1.dbs.User.findOne({ uid: _user.uid });
            if (record) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_USER_UID);
            }
            return globals_1.dbs.User.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user = yield globals_1.dbs.User.create({
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
                const profile = yield globals_1.dbs.UserProfile.create({ user_id }, transaction);
                const setting = yield globals_1.dbs.UserSetting.create({ user_id }, transaction);
                // following 에 자신 추가 - 나중을 위해...
                yield globals_1.dbs.Follow.create({ user_uid: _user.uid, target_uid: _user.uid }, transaction);
                yield this.setCookie(null, _user, { req, res });
                const udi = yield this.getUserDetailInfo(user, profile, setting);
                return {
                    user: Object.assign(Object.assign({}, udi), { email: user.email, email_verified: user.email_verified }),
                };
            }));
        });
        /**
         * 사용자 정보 가져오기
         * - 정보가 없을 경우 firebase 에서 가져와서 저장
         */
        this.getInfo = ({ registration_token }, _user, { req, res }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.User.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const { uid } = _user;
                let user = yield globals_1.dbs.User.getInfo({ uid }, transaction);
                if (!user) {
                    throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_USER_UID);
                }
                if (registration_token) {
                    yield firebase_admin_1.default.messaging().subscribeToTopic(registration_token, 'test-topic');
                    user.fcm_token = registration_token;
                    yield user.save({ transaction });
                }
                yield this.setCookie(null, _user, { req, res });
                const udi = yield this.getUserDetailInfo(user);
                return {
                    user: Object.assign(Object.assign({}, udi), { email: user.email, email_verified: user.email_verified }),
                };
            }));
        });
        this.getTargetInfoByUid = ({ target_uid }, { uid }) => __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.getProfileByUid({ uid: target_uid });
            const target = yield this.getUserDetailInfo(user);
            return {
                target,
            };
        });
        this.getTargetInfoByChannelId = ({ channel_id }, _) => __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.getProfileByChannelId({ channel_id });
            if (!user) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_CHANNEL_ID);
            }
            const target = yield this.getUserDetailInfo(user);
            return {
                target,
            };
        });
        this.getUserDetailInfo = (user, profile, setting) => __awaiter(this, void 0, void 0, function* () {
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
                email: user.email,
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
                setting: setting ? {
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
                dev_games: user.is_developer ? _.map(user.devGames, (game) => {
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
                        share_url: user ? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
                    };
                }) : undefined,
                game_records: user.game_records ? _.map(user.gameRecords, (gr) => {
                    const game = gr.game;
                    return {
                        game_uid: game.uid,
                        title: game.title,
                        url_thumb: game.url_thumb,
                        score: gr.score,
                    };
                }) : undefined,
            };
        });
        this.setInfo = (params, { uid }, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.User.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user = yield globals_1.dbs.User.getInfo({ uid }, transaction);
                if (!user) {
                    throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_USER_UID);
                }
                if (params.channel_id) {
                    user.channel_id = params.channel_id;
                }
                // 이름 변경
                if (params.name) {
                    // 이름 검사 해야함 - 불량 단어
                    user.name = params.name;
                }
                let profile;
                // 상태 메시지 변경
                if (params.state_msg) {
                    profile = yield globals_1.dbs.UserProfile.findOne({ user_id: user.id }, transaction);
                    profile.state_msg = params.state_msg;
                }
                // 채널 설명
                if (params.description) {
                    profile = profile || (yield globals_1.dbs.UserProfile.findOne({ user_id: user.id }, transaction));
                    profile.description = params.description;
                }
                if (profile) {
                    yield profile.save({ transaction });
                }
                let data;
                if (file) {
                    const webp = yield fileManager_1.default.convertToWebp(file, 80);
                    data = yield fileManager_1.default.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                    // const data: any = await FileManager.s3upload(file.name, file.path, uid);
                    user.picture = data.Location;
                }
                if (params.name || data) {
                    yield firebase_admin_1.default.auth().updateUser(uid, {
                        displayName: params.name ? params.name : undefined,
                        photoURL: data ? data.Location : undefined,
                    });
                }
                yield user.save({ transaction });
            }));
        });
        this.setBanner = ({}, { uid }, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            if (!file) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            const user = yield globals_1.dbs.User.findOne({ uid });
            const webp = yield fileManager_1.default.convertToWebp(file, 80);
            const data = yield fileManager_1.default.s3upload('banner.webp', webp[0].destinationPath, uid);
            yield globals_1.dbs.UserProfile.update({ url_banner: data.Location }, { user_id: user.id });
            return {
                url_banner: data.Location
            };
        });
        this.signOut = (_, _user, { req, res }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.User.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user = yield globals_1.dbs.User.getInfo({ uid: _user.uid }, transaction);
                yield firebase_admin_1.default.messaging().unsubscribeFromTopic(user.fcm_token, 'test-topic');
                user.fcm_token = null;
                yield user.save({ transaction });
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
            }));
        });
        this.updateSetting = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.UserSetting.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const setting = yield globals_1.dbs.UserSetting.findOne({ user_uid: uid }, transaction);
                if (params.theme)
                    setting.app_theme = params.theme;
                if (params.theme_extra)
                    setting.app_theme_extra = params.theme_extra;
                if (params.lang)
                    setting.app_language = params.lang;
                if (params.alarm)
                    setting.notify_alarm = params.alarm;
                if (params.battle)
                    setting.notify_battle = params.battle;
                if (params.beat)
                    setting.notify.beat = params.beat;
                if (params.follow)
                    setting.notify_follow = params.follow;
                if (params.like)
                    setting.notify_like = params.like;
                if (params.reply)
                    setting.notify_reply = params.reply;
                yield setting.save({ transaction });
            }));
        });
        this.updateExternalLink = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
        });
        this.deleteExternalLink = ({ id }, { uid }) => __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.findOne({ uid });
            yield globals_1.dbs.UserExternalLink.destroy({ user_id: user.id, id });
        });
        this.searchUser = ({ search_name, limit = 100, offset = 0 }, { uid }) => __awaiter(this, void 0, void 0, function* () {
            const users = yield globals_1.dbs.User.search({ search_name, limit, offset });
            return {
                users: _.map(users, (user) => {
                    return {
                        uid: user.uid,
                        name: user.name,
                        picture: user.picture,
                    };
                })
            };
        });
        this.leaveZempie = ({ num, text }, { uid }) => __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.UserLeftLog.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                yield globals_1.dbs.UserLeftLog.create({
                    user_uid: uid,
                    reason_num: num,
                    reason_text: text,
                }, transaction);
                yield globals_1.dbs.User.destroy({ uid }, transaction);
            }));
        });
    }
    verifyEmail({}, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecord = yield firebase_admin_1.default.auth().getUser(user.uid);
            if (userRecord.emailVerified) {
                yield firebase_admin_1.default.auth().updateUser(user.uid, {
                    emailVerified: true,
                });
                yield globals_1.dbs.User.update({ email_verified: true }, { uid: user.uid });
            }
        });
    }
    verifyChannelId({ channel_id }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            // 규칙 확인
            // if ok
            const dup = yield globals_1.dbs.User.findOne({ channel_id });
            if (dup) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.USER_DUPLICATED_CHANNEL_ID);
            }
            // await dbs.User.update({ channel_id }, { uid: user.uid });
        });
    }
}
exports.default = new UserController();
//# sourceMappingURL=userController.js.map