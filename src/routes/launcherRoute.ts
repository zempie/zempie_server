import { Router } from 'express';
import RpcController from '../controllers/rpcController';
import LauncherController from '../controllers/launcherController';
import convert from '../controllers/_convert';
import GameController from '../controllers/gameController';
import BattleController from '../controllers/battleController';


export default (router: Router) => {
    router.get(`/launch/game/:uid`,             convert(LauncherController.getGame));
    router.get(`/launch/battle/:uid`,           convert(LauncherController.getBattleGame));
    router.get(`/launch/shared/:uid`,           convert(LauncherController.getSharedGame));


    router.get(`/launch/host/battle`,           convert(LauncherController.getBattleUrl));
    router.get(`/launch/host/shared`,           convert(LauncherController.getSharedUrl));


    router.post(`/launch/game-start`,           convert(GameController.gameStart));
    router.post(`/launch/game-over`,            convert(GameController.gameOver));
    router.get(`/launch/game-ranking-global`,   convert(GameController.getGlobalRanking));


    router.post(`/launch/battle-start`,         convert(BattleController.gameStart));
    router.post(`/launch/battle-over`,          convert(BattleController.gameStart));
    router.post(`/launch/battle-update-name`,   convert(BattleController.updateUserName));
    router.get(`/launch/battle-ranking`,        convert(BattleController.getRanking));
}


RpcController.generator('launcher-game',        LauncherController.getGame);
RpcController.generator('launcher-battle',      LauncherController.getBattleGame);
RpcController.generator('launcher-share',       LauncherController.getSharedGame);


RpcController.generator('get-battle-url',       LauncherController.getBattleUrl);
RpcController.generator('get-shared-url',       LauncherController.getSharedUrl);
