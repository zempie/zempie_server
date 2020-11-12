import * as uniqid from 'uniqid';
import { dbs } from '../commons/globals';
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
        const game = await dbs.Game.getInfo(uid);

        return {
            game
        }
    }


    async getBattleGame({ uid }: ILauncherParams) {
        const battle = await dbs.Battle.getInfo(uid);

        return {
            battle_uid: battle.uid,
            battle: {
                uid: battle.uid,
                title: battle.title,
                user_count: battle.user_count,
                end_at: battle.end_at,
            },
            game: battle.game,
            host: battle.host,
        }
    }


    async getSharedGame({ uid }: ILauncherParams) {
        const sg = await dbs.SharedGame.getInfo(uid);

        return {
            game: sg.game,
        }
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
