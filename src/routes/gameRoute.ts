import { Router } from 'express';
import convert from '../controllers/_convert';
import { isAuthenticated, validateFirebaseIdToken } from './_common';
import GameController from '../controllers/game/gameController';
import GameContentController from '../controllers/game/gameContentController';
import BattleController from '../controllers/battleController';
import AdController from '../controllers/adController';
import RankingController from '../controllers/rankingController';


const apiVer = `/api/v1`;

export default (router: Router) => {
    router.get(`/game/:pathname/:pid`,          convert(GameController.playGame, true),    convert(GameController.redirectGame));
    router.get(`${apiVer}/game/:pathname`,      validateFirebaseIdToken,    convert(GameController.getGame));
    router.get(`${apiVer}/games`,               validateFirebaseIdToken,    convert(GameController.getGameList));
    router.get(`${apiVer}/games/s/:tag`,        validateFirebaseIdToken,    convert(GameController.getGameListByHashtag));
    router.get(`${apiVer}/games/ranking/g`,     validateFirebaseIdToken,    convert(RankingController.getGlobalRanking));
    router.get(`${apiVer}/games/ranking/f`,     validateFirebaseIdToken,    convert(RankingController.getFollowingRanking));


    router.post(`${apiVer}/game/ch-report`,     validateFirebaseIdToken,    isAuthenticated,    convert(GameContentController.createOrUpdateChallengingReport));


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
