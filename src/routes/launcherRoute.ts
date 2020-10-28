import { Router } from 'express';
import RpcController from '../controllers/rpcController';
import LauncherController from '../controllers/launcherController';
import convert from '../controllers/_convert';
import GameController from '../controllers/gameController';
import BattleController from '../controllers/battleController';
import { validateFirebaseIdToken } from './_common';


const apiVer = `/api/v1`
export default (router: Router) => {
    router.get(`${apiVer}/launch/game/:uid`,             convert(LauncherController.getGame));
    router.get(`${apiVer}/launch/battle/:uid`,           convert(LauncherController.getBattleGame));
    router.get(`${apiVer}/launch/shared/:uid`,           convert(LauncherController.getSharedGame));


    router.get(`${apiVer}/launch/host/battle`,           convert(LauncherController.getBattleUrl));
    router.get(`${apiVer}/launch/host/shared`,           convert(LauncherController.getSharedUrl));


    router.post(`${apiVer}/launch/game-start`,           validateFirebaseIdToken,   convert(GameController.gameStart));
    router.post(`${apiVer}/launch/game-over`,            validateFirebaseIdToken,   convert(GameController.gameOver));
    router.get(`${apiVer}/launch/game-ranking-global`,   convert(GameController.getGlobalRanking));


    router.post(`${apiVer}/launch/battle-start`,         convert(BattleController.gameStart));
    router.post(`${apiVer}/launch/battle-over`,          convert(BattleController.gameStart));
    router.post(`${apiVer}/launch/battle-update-name`,   convert(BattleController.updateUserName));
    router.get(`${apiVer}/launch/battle-ranking`,        convert(BattleController.getRanking));
}


RpcController.generator('launcher-game',        LauncherController.getGame);
RpcController.generator('launcher-battle',      LauncherController.getBattleGame);
RpcController.generator('launcher-share',       LauncherController.getSharedGame);


RpcController.generator('get-battle-url',       LauncherController.getBattleUrl);
RpcController.generator('get-shared-url',       LauncherController.getSharedUrl);
