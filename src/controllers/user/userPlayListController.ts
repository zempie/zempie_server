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

        const playlist = await dbs.UserPlayList.create({
            uid: playlist_uid,
            user_uid: user.uid,
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
            const playlist = await dbs.UserPlayList.findOne({ uid, user_uid: user.uid }, transaction);
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
        await dbs.UserPlayList.destroy({ uid, user_uid: user.uid });
    }


    /**
     * game in a playlist
     */
    addGame = async ({ uid, game_id }: any, user: DecodedIdToken) => {
        const playlist = await dbs.UserPlayList.findOne({ uid, user_uid: user.uid });
        if ( !playlist ) {
            throw CreateError(ErrorCodes.INVALID_PLAYLIST_UID);
        }

        const game = await dbs.Game.findOne({ game_id });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_ID);
        }

        const count = await dbs.UserPlayListGame.count({ userPlayList_id: playlist.id });
        await dbs.UserPlayListGame.create({
            userPlayList_id: playlist.id,
            num: count + 1,
            game_id: game.id,
        });
    }

    delGame = async ({ uid, game_id }: any, user: DecodedIdToken) => {
        const playlist = await dbs.UserPlayList.findOne({ uid, user_uid: user.uid });
        if ( !playlist ) {
            throw CreateError(ErrorCodes.INVALID_PLAYLIST_UID);
        }


    }

    sortGame = async () => {

    }
}


export default new UserPlayListController()
