import * as fs from 'fs';
import * as uniqid from 'uniqid';
import * as FileType from 'file-type';
import { IRoute } from './_interfaces';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import FileManager from "../services/fileManager";
import Opt from '../../config/opt';
import { caches, dbs } from "../commons/globals";
import { eProjectState } from "../commons/enums";
import * as _ from "lodash";
import { getGameData } from "./_common";
import { getLinkPreview } from "link-preview-js";
import { parseBoolean } from '../commons/utils';
import fileManager from '../services/fileManager';


const { AWS } = Opt;
const replaceExt = require('replace-ext');


class CommunityController {
    uploadImage = async (params: any, { uid }: DecodedIdToken, { req: { files: { file } } }: IRoute) => {
        if (!file) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        const webp = await FileManager.convertToWebp(file, 80);
        const key = replaceExt(uniqid(), '.webp');
        const data: any = await FileManager.s3upload({
            bucket: AWS.Bucket.Rsc,
            key,
            filePath: webp[0].destinationPath,
            uid,
            subDir: 'c/i',
        });

        return {
            url: data.Location,
        }
    }


    uploadFile = async (params: any, { uid }: DecodedIdToken, { req: { files } }: IRoute) => {
        if (!files) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        const ret = [];
        let fType = '';
        let idx = 0;
        for (let i in files) {
            if (!files.hasOwnProperty(i)) {
                continue
            }

            const file = files[i];
            let key = uniqid();
            let filePath = file.path;
            let subDir = 'c';
            const Body = fs.createReadStream(file.path);
            const { fileType }: any = await FileType.stream(Body);
            if (!fileType) {
                fs.unlink(file.path, () => {
                });
                throw CreateError(ErrorCodes.INVALID_FILE_TYPE);
            }
            let size = file.size;

            switch (fileType.mime) {
                case 'image/jpeg':
                case 'image/gif':
                    fType = 'image';
                    // break;
                case 'image/png':
                    const webp = await FileManager.convertToWebp(file, 80);
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
                case 'video/quicktime':
                    key = replaceExt(uniqid(), `.${fileType.ext}`);
                    subDir = 'c/v';
                    fType = 'video';
                    break;

                default:
                    fs.unlink(file.path, () => {
                    });
                    throw CreateError(ErrorCodes.INVALID_FILE_TYPE);
            }

            const data: any = await FileManager.s3upload({
                bucket: AWS.Bucket.Rsc,
                key,
                filePath,
                uid,
                subDir,
            });

            const bucket_url = await fileManager.hasBucketObject('thumbnail/' + data.key)

            ret.push({
                priority: idx,
                url: data.Location,
                size: file.size,
                type: fType,
                name: file.name,
                is_blind: parseBoolean(params.is_blind),
                thumbnail: bucket_url
            })
            idx++;
        }

        return ret;
    }


    getProject = async (params: any) => {
        if (!params.id) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        // const user1 = await dbs.User.findOne({ uid });

        const prj = await dbs.Project.getProject({ id: params.id });
        if (!prj || prj.state !== eProjectState.Normal) {
            throw CreateError(ErrorCodes.INVALID_ACCESS_PROJECT_ID);
        }
        return prj;
    }

    getTargetInfoByChannelId = async ({ channel_id }: { channel_id: string }, _user: DecodedIdToken) => {
        let channel = await caches.user.getChannel(channel_id);
        if (!channel) {
            // const user = await docs.User.getProfile({ channel_id });
            // if ( user ) {
            //     channel = await this.getUserDetailInfo(user);
            // }

            const user = await dbs.User.getProfileByChannelId({ channel_id });

            const followStatus = _user ? await dbs.Follow.followStatus(_user.uid, user.id) : null;
            const isFollowing = followStatus ? true : false;

            if (!user) {
                throw CreateError(ErrorCodes.INVALID_CHANNEL_ID);
            }

            channel = await this.getUserDetailInfo(user, undefined, undefined, isFollowing)
            // caches.user.setChannel(channel_id, channel);
        }
        return {
            target: channel
        }
    }
    getTargetInfoByUserId = async ({ user_id }: { user_id: string }, _user: DecodedIdToken) => {
        // let channel = await caches.user.getChannel(channel_id);
        // if ( !channel ) {
        // const user = await docs.User.getProfile({ channel_id });
        // if ( user ) {
        //     channel = await this.getUserDetailInfo(user);
        // }
        const user = await dbs.User.getProfileByUserID({ user_id });
        const followStatus = _user ? await dbs.Follow.followStatus(_user.uid, user.id) : null;
        const isFollowing = followStatus ? true : false;
        if (!user) {
            throw CreateError(ErrorCodes.INVALID_CHANNEL_ID);
        }

        const channel = await this.getUserDetailInfo(user, undefined, undefined, isFollowing)
        // caches.user.setChannel(channel_id, channel);
        // }
        return {
            target: channel
        }
    }
    private getUserDetailInfo = async (user: any, profile?: any, setting?: any, isFollowing?: boolean) => {
        profile = profile || user.profile;
        setting = setting || user.setting;
        const followingCnt = await this.followingCnt({ user_id: user.id })
        const followerCnt = await this.followerCnt({ user_id: user.id })
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
                dm_alarm: setting.notify_chat
            } : undefined,
            games: user.devGames,
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

    followingCnt = async ({ user_id }: { user_id: number }) => {
        return await dbs.Follow.followingCnt(user_id);
    }

    followerCnt = async ({ user_id }: { user_id: number }) => {
        return await dbs.Follow.followerCnt(user_id);
    }


    callbackSurvey = async ({ formId: form_id, results }: any, user: any, { req }: IRoute) => {
        let user_uid = '';
        const u = _.some(results, (r: any) => {
            if (r.type.toUpperCase() === 'TEXT' && r.title.toLowerCase().includes('uid')) {
                user_uid = r.response;
                return true;
            }
            return false;
        });

        if (u) {
            const user = await dbs.User.findOne({ uid: user_uid });
            if (!user) {
                throw CreateError(ErrorCodes.INVALID_SURVEY_USER_UID);
            }
            const survey = await dbs.Survey.findOne({ form_id });
            if (!survey) {
                throw CreateError(ErrorCodes.INVALID_SURVEY_FORM_ID);
            }
            await dbs.SurveyResult.create({ user_uid, survey_id: survey.id });
        }
    }
    getOgTag = async ({url} : {url:string}) => {
        
        if(url.includes('https://youtu.be/')){
            const youtube_path= new URL(url).pathname.substring(1);
            url = "https://www.youtube.com/watch?v=" + youtube_path
        }
        return await getLinkPreview(url)

    }

}


export default new CommunityController()
