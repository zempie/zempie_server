import * as fs from 'fs';
import * as uniqid from 'uniqid';
import * as FileType from 'file-type';
import { IRoute } from './_interfaces';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import FileManager from "../services/fileManager";
import Opt from '../../config/opt';
import {caches, dbs} from "../commons/globals";
import {eProjectState} from "../commons/enums";
import * as _ from "lodash";
import {getGameData} from "./_common";
const { AWS } = Opt;
const replaceExt = require('replace-ext');


class CommunityController {
    uploadImage = async (params: any, {uid}: DecodedIdToken, {req: {files: {file}}}: IRoute) => {
        if ( !file ) {
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


    uploadFile = async (params: any, {uid}: DecodedIdToken, {req: {files}}: IRoute) => {
        if ( !files ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        const ret = [];
        let fType = '';
        let idx = 0;
        for ( let i in files ) {
            if ( !files.hasOwnProperty(i) ) {
                continue
            }

            const file = files[i];
            let key = uniqid();
            let filePath = file.path;
            let subDir = 'c';
            const Body = fs.createReadStream(file.path);
            const { fileType }: any = await FileType.stream(Body);
            if ( !fileType ) {
                fs.unlink(file.path, () => {});
                throw CreateError(ErrorCodes.INVALID_FILE_TYPE);
            }

            let size = file.size;

            switch (fileType.mime) {
                case 'image/jpeg':
                case 'image/png':
                    const webp = await FileManager.convertToWebp(file, 80);
                    size = webp[0].data.length;
                    key = replaceExt(uniqid(), '.webp');
                    filePath = webp[0].destinationPath;
                    subDir = 'c/i';
                    fType='image';
                    break;

                case 'image/webp':
                    key = replaceExt(uniqid(), '.webp');
                    subDir = 'c/i';
                    fType='image';
                    break;

                case 'audio/x-m4a':
                case 'audio/mp4':
                case 'audio/mpeg':
                    key = replaceExt(uniqid(), `.${fileType.ext}`);
                    subDir = 'c/a';
                    fType='sound';
                    break;

                case 'video/mp4':
                    key = replaceExt(uniqid(), `.${fileType.ext}`);
                    subDir = 'c/v';
                    fType='video';
                    break;

                default:
                    fs.unlink(file.path, () => {});
                    throw CreateError(ErrorCodes.INVALID_FILE_TYPE);
            }

            const data: any = await FileManager.s3upload({
                bucket: AWS.Bucket.Rsc,
                key,
                filePath,
                uid,
                subDir,
            });

            ret.push({
                priority:idx,
                url: data.Location,
                size: file.size,
                type:fType

            })
            idx++;
        }

        return ret;
    }


    getProject = async ( params : any)=>{
        console.log('pratams', params)

        if( !params.id ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        // const user1 = await dbs.User.findOne({ uid });

        const prj = await dbs.Project.getProject( { id : params.id } );
        if ( !prj || prj.state !== eProjectState.Normal ) {
            throw CreateError(ErrorCodes.INVALID_ACCESS_PROJECT_ID);
        }
        return prj;
    }

    getTargetInfoByChannelId = async ({channel_id}: {channel_id: string}, _: DecodedIdToken) => {
        let channel = await caches.user.getChannel(channel_id);
        if ( !channel ) {
            // const user = await docs.User.getProfile({ channel_id });
            // if ( user ) {
            //     channel = await this.getUserDetailInfo(user);
            // }
            const user = await dbs.User.getProfileByChannelId({ channel_id });
            if ( !user ) {
                throw CreateError(ErrorCodes.INVALID_CHANNEL_ID);
            }

            channel = await this.getUserDetailInfo(user)
            // caches.user.setChannel(channel_id, channel);
        }
        return {
            target: channel
        }
    }

    private getUserDetailInfo = async (user: any, profile?: any, setting?: any) => {
        profile = profile || user.profile;
        setting = setting || user.setting;
        const followCnt = await this.followCnt({channel_id:user.uid} )

        return {
            id:user.id,
            uid: user.uid,
            name: user.name,
            channel_id: user.channel_id,
            email: user.email,
            picture: user.picture,
            is_developer: user.is_developer,
            follow_cnt:followCnt,
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
            games:user.devGames,
            dev_games: user.is_developer? _.map(user.devGames, (game: any) => {
                return {
                    activated: game.activated,
                    ...getGameData(game),
                }
            }) : undefined,
            game_records: user.game_records? _.map(user.game_records, (gr: any) => {
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

    followCnt = async ({channel_id}: {channel_id: string})=>{
        const user = await dbs.User.getProfile({channel_id:channel_id})
        console.log(user)
        const followCnt = await dbs.Follow.followCnt(user.id)
        return followCnt
    }
}


export default new CommunityController()
