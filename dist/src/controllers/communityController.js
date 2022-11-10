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
const fs = require("fs");
const uniqid = require("uniqid");
const FileType = require("file-type");
const errorCodes_1 = require("../commons/errorCodes");
const fileManager_1 = require("../services/fileManager");
const opt_1 = require("../../config/opt");
const globals_1 = require("../commons/globals");
const enums_1 = require("../commons/enums");
const _ = require("lodash");
const _common_1 = require("./_common");
const urlMetadata = require('url-metadata');
const { AWS } = opt_1.default;
const replaceExt = require('replace-ext');
class CommunityController {
    constructor() {
        this.uploadImage = (params, { uid }, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            if (!file) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            const webp = yield fileManager_1.default.convertToWebp(file, 80);
            const key = replaceExt(uniqid(), '.webp');
            const data = yield fileManager_1.default.s3upload({
                bucket: AWS.Bucket.Rsc,
                key,
                filePath: webp[0].destinationPath,
                uid,
                subDir: 'c/i',
            });
            return {
                url: data.Location,
            };
        });
        this.uploadFile = (params, { uid }, { req: { files } }) => __awaiter(this, void 0, void 0, function* () {
            if (!files) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            const ret = [];
            let fType = '';
            let idx = 0;
            for (let i in files) {
                if (!files.hasOwnProperty(i)) {
                    continue;
                }
                const file = files[i];
                let key = uniqid();
                let filePath = file.path;
                let subDir = 'c';
                const Body = fs.createReadStream(file.path);
                const { fileType } = yield FileType.stream(Body);
                if (!fileType) {
                    fs.unlink(file.path, () => {
                    });
                    throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_FILE_TYPE);
                }
                let size = file.size;
                switch (fileType.mime) {
                    case 'image/jpeg':
                    case 'image/gif':
                        fType = 'image';
                        break;
                    case 'image/png':
                        const webp = yield fileManager_1.default.convertToWebp(file, 80);
                        size = webp[0].data.length;
                        key = replaceExt(uniqid(), '.webp');
                        filePath = webp[0].destinationPath;
                        subDir = 'c/i';
                        fType = 'image';
                        break;
                    case 'image/webp':
                        key = replaceExt(uniqid(), '.webp');
                        subDir = 'c/i';
                        fType = 'image';
                        break;
                    case 'audio/x-m4a':
                    case 'audio/mp4':
                    case 'audio/mpeg':
                        key = replaceExt(uniqid(), `.${fileType.ext}`);
                        subDir = 'c/a';
                        fType = 'sound';
                        break;
                    case 'video/mp4':
                        key = replaceExt(uniqid(), `.${fileType.ext}`);
                        subDir = 'c/v';
                        fType = 'video';
                        break;
                    default:
                        fs.unlink(file.path, () => {
                        });
                        throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_FILE_TYPE);
                }
                const data = yield fileManager_1.default.s3upload({
                    bucket: AWS.Bucket.Rsc,
                    key,
                    filePath,
                    uid,
                    subDir,
                });
                ret.push({
                    priority: idx,
                    url: data.Location,
                    size: file.size,
                    type: fType,
                    name: file.name
                });
                idx++;
            }
            return ret;
        });
        this.getProject = (params) => __awaiter(this, void 0, void 0, function* () {
            if (!params.id) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            // const user1 = await dbs.User.findOne({ uid });
            const prj = yield globals_1.dbs.Project.getProject({ id: params.id });
            if (!prj || prj.state !== enums_1.eProjectState.Normal) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_ACCESS_PROJECT_ID);
            }
            return prj;
        });
        this.getTargetInfoByChannelId = ({ channel_id }, _user) => __awaiter(this, void 0, void 0, function* () {
            let channel = yield globals_1.caches.user.getChannel(channel_id);
            if (!channel) {
                // const user = await docs.User.getProfile({ channel_id });
                // if ( user ) {
                //     channel = await this.getUserDetailInfo(user);
                // }
                const user = yield globals_1.dbs.User.getProfileByChannelId({ channel_id });
                const followStatus = _user ? yield globals_1.dbs.Follow.followStatus(_user.uid, user.id) : null;
                const isFollowing = followStatus ? true : false;
                if (!user) {
                    throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_CHANNEL_ID);
                }
                channel = yield this.getUserDetailInfo(user, undefined, undefined, isFollowing);
                // caches.user.setChannel(channel_id, channel);
            }
            return {
                target: channel
            };
        });
        this.getTargetInfoByUserId = ({ user_id }, _user) => __awaiter(this, void 0, void 0, function* () {
            // let channel = await caches.user.getChannel(channel_id);
            // if ( !channel ) {
            // const user = await docs.User.getProfile({ channel_id });
            // if ( user ) {
            //     channel = await this.getUserDetailInfo(user);
            // }
            const user = yield globals_1.dbs.User.getProfileByUserID({ user_id });
            const followStatus = _user ? yield globals_1.dbs.Follow.followStatus(_user.uid, user.id) : null;
            const isFollowing = followStatus ? true : false;
            if (!user) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_CHANNEL_ID);
            }
            const channel = yield this.getUserDetailInfo(user, undefined, undefined, isFollowing);
            // caches.user.setChannel(channel_id, channel);
            // }
            return {
                target: channel
            };
        });
        this.getUserDetailInfo = (user, profile, setting, isFollowing) => __awaiter(this, void 0, void 0, function* () {
            profile = profile || user.profile;
            setting = setting || user.setting;
            const followingCnt = yield this.followingCnt({ user_id: user.id });
            const followerCnt = yield this.followerCnt({ user_id: user.id });
            return {
                id: user.id,
                uid: user.uid,
                name: user.name,
                channel_id: user.channel_id,
                email: user.email,
                picture: user.picture,
                is_developer: user.is_developer,
                following_cnt: followingCnt,
                follower_cnt: followerCnt,
                is_following: isFollowing,
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
                    battle: setting.notify_battle,
                    beat: setting.notify_beat,
                    // follow: setting.notify_follow,
                    like: setting.notify_like,
                    reply: setting.notify_reply,
                } : undefined,
                games: user.devGames,
                dev_games: user.is_developer ? _.map(user.devGames, (game) => {
                    return Object.assign({ activated: game.activated }, (0, _common_1.getGameData)(game));
                }) : undefined,
                game_records: user.game_records ? _.map(user.game_records, (gr) => {
                    const game = gr.game;
                    return {
                        game_id: game.id,
                        title: game.title,
                        url_thumb: game.url_thumb,
                        score: gr.score,
                    };
                }) : undefined,
            };
        });
        this.followingCnt = ({ user_id }) => __awaiter(this, void 0, void 0, function* () {
            return yield globals_1.dbs.Follow.followingCnt(user_id);
        });
        this.followerCnt = ({ user_id }) => __awaiter(this, void 0, void 0, function* () {
            return yield globals_1.dbs.Follow.followerCnt(user_id);
        });
        this.getOgTag = ({ url }) => __awaiter(this, void 0, void 0, function* () {
            return yield urlMetadata(url);
        });
        this.callbackSurvey = ({ formId: form_id, results }, user, { req }) => __awaiter(this, void 0, void 0, function* () {
            let user_uid = '';
            const u = _.some(results, (r) => {
                if (r.type.toUpperCase() === 'TEXT' && r.title.toLowerCase().includes('uid')) {
                    user_uid = r.response;
                    return true;
                }
                return false;
            });
            if (u) {
                const user = yield globals_1.dbs.User.findOne({ uid: user_uid });
                if (!user) {
                    throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_SURVEY_USER_UID);
                }
                const survey = yield globals_1.dbs.Survey.findOne({ form_id });
                if (!survey) {
                    throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_SURVEY_FORM_ID);
                }
                yield globals_1.dbs.SurveyResult.create({ user_uid, survey_id: survey.id });
            }
        });
    }
}
exports.default = new CommunityController();
//# sourceMappingURL=communityController.js.map