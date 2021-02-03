"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const _common_1 = require("./_common");
const gameController_1 = require("../controllers/game/gameController");
const gameContentController_1 = require("../controllers/game/gameContentController");
const battleController_1 = require("../controllers/battleController");
const rankingController_1 = require("../controllers/rankingController");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.get(`${apiVer}/featured`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.featuredList));
    router.get(`/game/:pathname/:pid`, _convert_1.default(gameController_1.default.playGame, true), _convert_1.default(gameController_1.default.redirectGame));
    router.get(`${apiVer}/game/:pathname`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.getGame));
    router.get(`${apiVer}/games`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.getGameList));
    router.get(`${apiVer}/games/hashtags/:tag`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.getHashTags));
    router.get(`${apiVer}/games/tagged/:id`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.getHashTagById));
    router.get(`${apiVer}/games/s/:tag`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.getGameListByHashtag));
    router.get(`${apiVer}/games/ranking/g`, _common_1.validateFirebaseIdToken, _convert_1.default(rankingController_1.default.getGlobalRanking));
    router.get(`${apiVer}/games/ranking/f`, _common_1.validateFirebaseIdToken, _convert_1.default(rankingController_1.default.getFollowingRanking));
    // 게임 하르 ❤
    router.post(`${apiVer}/game/heart`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _convert_1.default(gameContentController_1.default.heart));
    // 게임 감정 표현
    router.post(`${apiVer}/game/emotion`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _convert_1.default(gameContentController_1.default.emotion));
    // 도전 게임 - 평가 리포트
    router.get(`${apiVer}/game/ch-report`, _common_1.validateFirebaseIdToken, _convert_1.default(gameContentController_1.default.getReports));
    router.post(`${apiVer}/game/ch-report`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _convert_1.default(gameContentController_1.default.createOrUpdateChallengingReport));
    // for testing
    router.get(`${apiVer}/sample-test`, _convert_1.default(gameController_1.default.sampleTest));
    router.get(`${apiVer}/cache-test`, _convert_1.default(gameController_1.default.cacheTest));
    router.get(`${apiVer}/cache-test2`, _convert_1.default(gameController_1.default.cacheTest2));
    router.post(`${apiVer}/test-badword`, _convert_1.default(gameController_1.default.tagTest));
    router.get(`${apiVer}/tag-test/search`, _convert_1.default(gameController_1.default.tagTest2));
    // deprecated
    router.post(`${apiVer}/game/start`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.gameStart));
    router.post(`${apiVer}/game/over`, _common_1.validateFirebaseIdToken, _convert_1.default(gameController_1.default.gameOver));
    router.get(`${apiVer}/battles/`, _common_1.validateFirebaseIdToken, _convert_1.default(battleController_1.default.getBattleList));
    router.get(`${apiVer}/battle/battle_id`, _convert_1.default(battleController_1.default.getInfo));
    router.post(`${apiVer}/battle/host`, _convert_1.default(battleController_1.default.hostBattle));
    router.post(`${apiVer}/battle/start`, _convert_1.default(battleController_1.default.gameStart));
    router.post(`${apiVer}/battle/over`, _convert_1.default(battleController_1.default.gameOver));
};
//# sourceMappingURL=gameRoute.js.map