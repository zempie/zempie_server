import * as uniqid from 'uniqid';
import { caches, dbs } from '../commons/globals';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import Opt from '../../config/opt';
const { Url, Deploy } = Opt;


interface ILauncherParams {
    uid: string
    game_id: number
    game_uid: string
}


class LauncherController {
    async getGame({ uid }: ILauncherParams) {
        let ret = await caches.game.getByUid(uid);
        if ( !ret ) {
            const game = await dbs.Game.getInfo({uid});
            ret = {
                game: {
                    uid: game.uid,
                    pathname: game.pathname,
                    title: game.title,
                    description: game.description,
                    control_type: game.control_type,
                    hashtags: game.hashtags,
                    url_game: game.url_game,
                    url_thumb: game.url_thumb,
                    user: {
                        uid: game.user.uid,
                        name: game.user.name,
                        channel_id: game.user.channel_id,
                        picture: game.user.picture,
                    }
                },
            }
            caches.game.setByUid(ret, uid);
        }
        return ret;
    }


    async getBattleGame({ uid }: ILauncherParams) {
        let ret = await caches.game.getBattle(uid);
        if ( !ret ) {
            const battle = await dbs.Battle.getInfo(uid);
            const { host, game } = battle;
            ret = {
                battle_uid: battle.uid,
                battle: {
                    uid: battle.uid,
                    title: battle.title,
                    user_count: battle.user_count,
                    end_at: battle.end_at,
                },
                game: {
                    uid: game.uid,
                    pathname: game.pathname,
                    title: game.title,
                    description: game.description,
                    control_type: game.control_type,
                    hashtags: game.hashtags,
                    url_game: game.url_game,
                    url_thumb: game.url_thumb,
                    user: {
                        uid: game.user.uid,
                        name: game.user.name,
                        channel_id: game.user.channel_id,
                        picture: game.user.picture,
                    }
                },
                host: {
                    uid: host.uid,
                    name: host.name,
                    channel_id: host.channel_id,
                    picture: host.picture,
                },
            }
            caches.game.setBattle(ret, uid);
        }
        return ret;
    }


    async getSharedGame({ uid }: ILauncherParams) {
        let ret = await caches.game.getShared(uid);
        if ( !ret ) {
            const sg = await dbs.SharedGame.getInfo({uid});
            const { game, user } = sg;
            ret = {
                user: {
                    uid: user.uid,
                    name: user.name,
                    channel_id: user.channel_id,
                    picture: user.picture,
                },
                game: {
                    uid: game.uid,
                    pathname: game.pathname,
                    title: game.title,
                    description: game.description,
                    control_type: game.control_type,
                    hashtags: game.hashtags,
                    url_game: game.url_game,
                    url_thumb: game.url_thumb,
                    user: {
                        uid: game.user.uid,
                        name: game.user.name,
                        channel_id: game.user.channel_id,
                        picture: game.user.picture,
                    }
                },
            }
            caches.game.setShared(ret, uid);
        }
        return ret;
    }


    /**
     *
     */
    async getSharedUrl({ game_uid }: ILauncherParams, { uid: user_uid }: DecodedIdToken) {
        const uid = await dbs.SharedGame.getSharedUid({ user_uid, game_uid });

        return {
            shared_uid: uid,
            shared_url: `${Url.Launcher}/shared/${uid}`
        }
    }


    async getBattleUrl({ game_uid }: ILauncherParams, { uid: user_uid }: DecodedIdToken) {
        const uid = uniqid();

        await dbs.Battle.create({
            uid,
            user_uid,
            game_uid,
            end_at: Date.now() + (1000 * 60 * 10),
        })

        return {
            battle_uid: uid,
            battle_url: `${Url.Launcher}/battle/${uid}`
        }
    }
}


export default new LauncherController()
