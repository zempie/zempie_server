import { dbs } from '../../commons/globals';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import * as _ from 'lodash';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { getGameData } from '../_common';


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


    createPlaylist = async () => {
        await dbs.UserPlaylist.create({

        })
    }


    updatePlaylist = async () => {

    }

    deletePlaylist = async () => {

    }
}


export default new UserPlayListController()
