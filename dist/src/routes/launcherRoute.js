"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const launcherController_1 = require("../controllers/launcherController");
const _convert_1 = require("../controllers/_convert");
const gameController_1 = require("../controllers/game/gameController");
const battleController_1 = require("../controllers/battleController");
const rankingController_1 = require("../controllers/rankingController");
const _common_1 = require("./_common");
const apiVer = `/api/v1`;
exports.default = (router) => {
    // 게임 실행
    router.get(`${apiVer}/launch/game/:pathname`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(launcherController_1.default.getGame));
    router.get(`${apiVer}/launch/battle/:uid`, (0, _convert_1.default)(launcherController_1.default.getBattleGame));
    router.get(`${apiVer}/launch/shared/:uid`, (0, _convert_1.default)(launcherController_1.default.getSharedGame));
    // 링크 생성
    router.post(`${apiVer}/launch/host/battle`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(launcherController_1.default.getBattleUrl));
    router.post(`${apiVer}/launch/host/shared`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(launcherController_1.default.getSharedUrl));
    // 젬파이
    router.post(`${apiVer}/launch/game-start`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.gameStart));
    router.post(`${apiVer}/launch/game-over`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.gameOver));
    router.get(`${apiVer}/launch/game-ranking/:game_id`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(rankingController_1.default.getGlobalRanking));
    // 배틀
    router.post(`${apiVer}/launch/battle-start`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(battleController_1.default.gameStart));
    router.post(`${apiVer}/launch/battle-over`, (0, _convert_1.default)(battleController_1.default.gameOver));
    router.post(`${apiVer}/launch/battle-update-name`, (0, _convert_1.default)(battleController_1.default.updateUserName));
    router.get(`${apiVer}/launch/battle-ranking/:battle_uid`, (0, _convert_1.default)(battleController_1.default.getRanking));
};
//# sourceMappingURL=launcherRoute.js.map