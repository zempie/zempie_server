"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const _common_1 = require("./_common");
const rpcController_1 = require("../controllers/rpcController");
const gameController_1 = require("../controllers/gameController");
const battleController_1 = require("../controllers/battleController");
const adController_1 = require("../controllers/adController");
const rankingController_1 = require("../controllers/rankingController");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.get(`/game/:pathname/:pid`, _convert_1.default(gameController_1.default.playGame, true), _convert_1.default(gameController_1.default.redirectGame));
    router.get(`${apiVer}/games`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.getGameList));
    router.get(`${apiVer}/games/s/:tag`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.getGameListByHashtag));
    router.get(`${apiVer}/games/ranking/g`, _common_1.validateFirebaseIdToken, _convert_1.default(rankingController_1.default.getGlobalRanking));
    router.get(`${apiVer}/games/ranking/f`, _common_1.validateFirebaseIdToken, _convert_1.default(rankingController_1.default.getFollowingRanking));
    // for testing
    router.get(`${apiVer}/sample-test`, _convert_1.default(gameController_1.default.sampleTest));
    router.get(`${apiVer}/cache-test`, _convert_1.default(gameController_1.default.cacheTest));
    router.get(`${apiVer}/cache-test2`, _convert_1.default(gameController_1.default.cacheTest2));
    // deprecated
    router.post(`${apiVer}/game/start`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.gameStart));
    router.post(`${apiVer}/game/over`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.gameOver));
    router.get(`${apiVer}/battles/`, _common_1.validateFirebaseIdToken, _convert_1.default(battleController_1.default.getBattleList));
    router.get(`${apiVer}/battle/battle_id`, _convert_1.default(battleController_1.default.getInfo));
    router.post(`${apiVer}/battle/host`, _convert_1.default(battleController_1.default.hostBattle));
    router.post(`${apiVer}/battle/start`, _convert_1.default(battleController_1.default.gameStart));
    router.post(`${apiVer}/battle/over`, _convert_1.default(battleController_1.default.gameOver));
};
rpcController_1.default.generator('get-game', gameController_1.default.getGame);
rpcController_1.default.generator('get-games', gameController_1.default.getGameList);
rpcController_1.default.generator('game-start', gameController_1.default.gameStart, true);
rpcController_1.default.generator('game-over', gameController_1.default.gameOver, true);
rpcController_1.default.generator('get-ranking-global', rankingController_1.default.getGlobalRanking, true);
rpcController_1.default.generator('get-ranking-follow', rankingController_1.default.getFollowingRanking, true);
rpcController_1.default.generator('ad-completed', adController_1.default.onRewardedVideoCompleted);
rpcController_1.default.generator('get-battles', battleController_1.default.getBattleList);
rpcController_1.default.generator('get-ranking-battle', battleController_1.default.getRanking);
rpcController_1.default.generator('battle', battleController_1.default.getInfo);
rpcController_1.default.generator('battle-host', battleController_1.default.hostBattle, true);
rpcController_1.default.generator('battle-start', battleController_1.default.gameStart);
rpcController_1.default.generator('battle-over', battleController_1.default.gameOver);
rpcController_1.default.generator('battle-update-name', battleController_1.default.updateUserName);
rpcController_1.default.generator('sample-test', gameController_1.default.sampleTest);
//# sourceMappingURL=gameRoute.js.map