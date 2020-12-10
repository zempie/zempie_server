import * as _ from 'lodash';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { v4 as uuid } from 'uuid';
import * as uniqid from 'uniqid';
import { dbs } from '../../commons/globals';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { getGameData } from '../_common';
import { IRoute } from '../_interfaces';
import FileManager from '../../services/fileManager';
import { Transaction } from 'sequelize';
const replaceExt = require('replace-ext');


class UserPlayListController {
    getPlayList = async ({ uid }: { uid: string }, _user: DecodedIdToken) => {
        const playlist = await dbs.UserPlayList.getPlayList({ uid });
        if ( !playlist ) {
            throw CreateError(ErrorCodes.INVALID_PLAYLIST_UID);
        }

        const { user } = playlist;
        return {
            uid: playlist.uid,
            title: playlist.title,
            url_bg: playlist.url_bg,
            user: {
                uid: user.uid,
                name: user.name,
                picture: user.picture,
            },
            games: _.map(playlist.games, (obj: any) => {
                const { game } = obj;
                return getGameData(game);
            }),
        }
    }


    createPlaylist = async ({ title }: any, user: DecodedIdToken, {req:{files:{file}}}: IRoute) => {
        let data: any;
        const playlist_uid = uniqid();
        if ( file ) {
            const webp = await FileManager.convertToWebp(file, 80);
            data = await FileManager.s3upload3({
                key: replaceExt(`playlist_${playlist_uid}`, '.webp'),
                filePath: webp[0].destinationPath,
                uid: user.uid,
                bucket: '/playlist',
            });
        }

        const userRecord = await dbs.User.findOne({ uid: user.uid });
        const playlist = await dbs.UserPlayList.create({
            user_id: userRecord.id,
            uid: playlist_uid,
            title,
            url_bg: data.Location,
        });

        return {
            playlist: {
                uid: playlist.uid,
                title: playlist.title,
                url_bg: data? data.Location : null,
                updated_at: playlist.updated_at,
            }
        }
    }


    updatePlaylist = async ({ uid, title }: any, user: DecodedIdToken, {req:{files:{file}}}: IRoute) => {
        await dbs.UserPlayList.getTransaction(async (transaction: Transaction) => {
            const userRecord = await dbs.User.findOne({ uid: user.uid });
            const playlist = await dbs.UserPlayList.findOne({ uid, user_id: userRecord.id }, transaction);
            if ( !playlist ) {
                throw CreateError(ErrorCodes.INVALID_PLAYLIST_UID);
            }

            let data: any;
            if ( file ) {
                const webp = await FileManager.convertToWebp(file, 80);
                data = await FileManager.s3upload3({
                    key: replaceExt(`playlist_${uid}`, '.webp'),
                    filePath: webp[0].destinationPath,
                    uid: user.uid,
                    bucket: '/playlist',
                });
            }

            playlist.title = title || playlist.title;
            playlist.url_bg = data? data.Location : playlist.url_bg;
            playlist.save({ transaction });

            return {
                playlist: {
                    uid,
                    title: playlist.title,
                    url_bg: playlist.url_bg,
                    updated_at: playlist.updated_at,
                }
            }
        })
    }

    deletePlaylist = async ({ uid }: any, user: DecodedIdToken) => {
        const userRecord = await dbs.User.findOne({ uid: user.uid });
        await dbs.UserPlayList.destroy({ uid, user_id: userRecord.id });
    }


    /**
     * game in a playlist
     */
    addGame = async () => {

    }

    delGame = async () => {

    }

    sortGame = async () => {

    }
}


export default new UserPlayListController()
