"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpcController_1 = require("../controllers/rpcController");
const launcherController_1 = require("../controllers/launcherController");
const _convert_1 = require("../controllers/_convert");
const gameController_1 = require("../controllers/gameController");
const battleController_1 = require("../controllers/battleController");
const rankingController_1 = require("../controllers/rankingController");
const _common_1 = require("./_common");
const apiVer = `/api/v1`;
exports.default = (router) => {
    // 게임 실행
    router.get(`${apiVer}/launch/game/:uid`, _convert_1.default(launcherController_1.default.getGame));
    router.get(`${apiVer}/launch/battle/:uid`, _convert_1.default(launcherController_1.default.getBattleGame));
    router.get(`${apiVer}/launch/shared/:uid`, _convert_1.default(launcherController_1.default.getSharedGame));
    // 링크 생성
    router.post(`${apiVer}/launch/host/battle`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _convert_1.default(launcherController_1.default.getBattleUrl));
    router.post(`${apiVer}/launch/host/shared`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _convert_1.default(launcherController_1.default.getSharedUrl));
    // 젬파이
    router.post(`${apiVer}/launch/game-start`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.gameStart));
    router.post(`${apiVer}/launch/game-over`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.gameOver));
    router.get(`${apiVer}/launch/game-ranking/:game_uid`, _common_1.validateFirebaseIdToken, _convert_1.default(rankingController_1.default.getGlobalRanking));
    // 배틀
    router.post(`${apiVer}/launch/battle-start`, _common_1.validateFirebaseIdToken, _convert_1.default(battleController_1.default.gameStart));
    router.post(`${apiVer}/launch/battle-over`, _convert_1.default(battleController_1.default.gameOver));
    router.post(`${apiVer}/launch/battle-update-name`, _convert_1.default(battleController_1.default.updateUserName));
    router.get(`${apiVer}/launch/battle-ranking/:battle_uid`, _convert_1.default(battleController_1.default.getRanking));
};
rpcController_1.default.generator('launcher-game', launcherController_1.default.getGame);
rpcController_1.default.generator('launcher-battle', launcherController_1.default.getBattleGame);
rpcController_1.default.generator('launcher-share', launcherController_1.default.getSharedGame);
rpcController_1.default.generator('get-battle-url', launcherController_1.default.getBattleUrl);
rpcController_1.default.generator('get-shared-url', launcherController_1.default.getSharedUrl);
//# sourceMappingURL=launcherRoute.js.map