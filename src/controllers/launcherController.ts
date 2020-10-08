import { dbs } from '../commons/globals';

interface ILauncherParams {
    uid: string
}


class LauncherController {
    async getGame({ uid }: ILauncherParams) {
        const game = await dbs.Game.getInfo(uid);

        return {
            game
        }
    }


    async getBattleGame({ uid }: ILauncherParams) {
        const game = await dbs.Battle.getInfo(uid);

        return {
            game
        }
    }


    async getSharedGame({ uid }: ILauncherParams) {
        
    }
}


export default new LauncherController()
