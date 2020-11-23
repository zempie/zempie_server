import { Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import RpcController from '../controllers/rpcController';
import GameController from '../controllers/gameController';
import BattleController from '../controllers/battleController';
import AdController from '../controllers/adController';
import RankingController from '../controllers/rankingController';


const apiVer = `/api/v1`;

export default (router: Router) => {
    router.get(`/game/:pathname/:pid`,          convert(GameController.playGame, true),    convert(GameController.redirectGame));
    router.get(`${apiVer}/games`,               validateFirebaseIdToken,    convert(GameController.getGameList));
    router.get(`${apiVer}/games/s/:tag`,        validateFirebaseIdToken,    convert(GameController.getGameListByHashtag));
    router.get(`${apiVer}/games/ranking/g`,     validateFirebaseIdToken,    convert(RankingController.getGlobalRanking));
    router.get(`${apiVer}/games/ranking/f`,     validateFirebaseIdToken,    convert(RankingController.getFollowingRanking));



    // for testing
    router.get(`${apiVer}/sample-test`,         convert(GameController.sampleTest));
    router.get(`${apiVer}/cache-test`,          convert(GameController.cacheTest));
    router.get(`${apiVer}/cache-test2`,         convert(GameController.cacheTest2));


    // deprecated
    router.post(`${apiVer}/game/start`,         validateFirebaseIdToken,    convert(GameController.gameStart));
    router.post(`${apiVer}/game/over`,          validateFirebaseIdToken,    convert(GameController.gameOver));
    router.get(`${apiVer}/battles/`,            validateFirebaseIdToken,    convert(BattleController.getBattleList));
    router.get(`${apiVer}/battle/battle_id`,    convert(BattleController.getInfo));
    router.post(`${apiVer}/battle/host`,        convert(BattleController.hostBattle));
    router.post(`${apiVer}/battle/start`,       convert(BattleController.gameStart));
    router.post(`${apiVer}/battle/over`,        convert(BattleController.gameOver));
}



RpcController.generator('get-game',             GameController.getGame);
RpcController.generator('get-games',            GameController.getGameList);
RpcController.generator('game-start',           GameController.gameStart, true);
RpcController.generator('game-over',            GameController.gameOver, true);
RpcController.generator('get-ranking-global',   RankingController.getGlobalRanking, true);
RpcController.generator('get-ranking-follow',   RankingController.getFollowingRanking, true);

RpcController.generator('ad-completed',         AdController.onRewardedVideoCompleted);

RpcController.generator('get-battles',          BattleController.getBattleList);
RpcController.generator('get-ranking-battle',   BattleController.getRanking);
RpcController.generator('battle',               BattleController.getInfo);
RpcController.generator('battle-host',          BattleController.hostBattle, true);
RpcController.generator('battle-start',         BattleController.gameStart);
RpcController.generator('battle-over',          BattleController.gameOver);
RpcController.generator('battle-update-name',   BattleController.updateUserName);

RpcController.generator('sample-test',          GameController.sampleTest);
