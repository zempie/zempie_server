import { NextFunction, Request, Response, Router } from 'express';
import RpcController from '../controllers/rpcController';
import LauncherController from '../controllers/launcherController';
import convert from '../controllers/_convert';
import GameController from '../controllers/gameController';
import BattleController from '../controllers/battleController';
import RankingController from '../controllers/rankingController';
import { isAuthenticated, validateFirebaseIdToken } from './_common';


const apiVer = `/api/v1`
export default (router: Router) => {
    // 게임 실행
    router.get(`${apiVer}/launch/game/:uid`,    convert(LauncherController.getGame));
    router.get(`${apiVer}/launch/battle/:uid`,  convert(LauncherController.getBattleGame));
    router.get(`${apiVer}/launch/shared/:uid`,  convert(LauncherController.getSharedGame));


    // 링크 생성
    router.post(`${apiVer}/launch/host/battle`, validateFirebaseIdToken,   isAuthenticated,    convert(LauncherController.getBattleUrl));
    router.post(`${apiVer}/launch/host/shared`, validateFirebaseIdToken,   isAuthenticated,    convert(LauncherController.getSharedUrl));


    // 젬파이
    router.post(`${apiVer}/launch/game-start`,  validateFirebaseIdToken,   convert(GameController.gameStart));
    router.post(`${apiVer}/launch/game-over`,   validateFirebaseIdToken,   convert(GameController.gameOver));
    router.get(`${apiVer}/launch/game-ranking/:game_uid`,   validateFirebaseIdToken,     convert(RankingController.getGlobalRanking));


    // 배틀
    router.post(`${apiVer}/launch/battle-start`,    validateFirebaseIdToken,   convert(BattleController.gameStart));
    router.post(`${apiVer}/launch/battle-over`,     convert(BattleController.gameOver));
    router.post(`${apiVer}/launch/battle-update-name`,  convert(BattleController.updateUserName));
    router.get(`${apiVer}/launch/battle-ranking/:battle_uid`,   convert(BattleController.getRanking));
}


RpcController.generator('launcher-game',        LauncherController.getGame);
RpcController.generator('launcher-battle',      LauncherController.getBattleGame);
RpcController.generator('launcher-share',       LauncherController.getSharedGame);


RpcController.generator('get-battle-url',       LauncherController.getBattleUrl);
RpcController.generator('get-shared-url',       LauncherController.getSharedUrl);
