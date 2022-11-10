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
    router.get(`${apiVer}/featured`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.featuredList));
    // 게임 하르 ❤
    router.post(`${apiVer}/game/heart`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(gameContentController_1.default.heart));
    // 게임 감정 표현
    router.post(`${apiVer}/game/emotion`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(gameContentController_1.default.emotion));
    // 도전 게임 - 평가 리포트
    router.get(`${apiVer}/game/ch-report`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameContentController_1.default.getReports));
    router.post(`${apiVer}/game/ch-report`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(gameContentController_1.default.createOrUpdateChallengingReport));
    // 게임 감정 표현
    router.post(`${apiVer}/game/emotion`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(gameContentController_1.default.emotion));
    // 게임 댓글
    router.get(`${apiVer}/game/reply`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameContentController_1.default.getReplies));
    router.get(`${apiVer}/game/rereply`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameContentController_1.default.getReReplies));
    router.post(`${apiVer}/game/reply`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(gameContentController_1.default.leaveReply));
    router.post(`${apiVer}/game/reply/reaction`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(gameContentController_1.default.reactReply));
    // 도전 게임 - 평가 리포트
    router.get(`${apiVer}/game/ch-report`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameContentController_1.default.getReports));
    router.post(`${apiVer}/game/ch-report`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(gameContentController_1.default.createOrUpdateChallengingReport));
    router.get(`/game/:pathname/:pid`, (0, _convert_1.default)(gameController_1.default.playGame, true), (0, _convert_1.default)(gameController_1.default.redirectGame));
    router.get(`${apiVer}/game/:pathname`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.getGame));
    router.get(`${apiVer}/games`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.getGameList));
    router.get(`${apiVer}/games/hashtags/:tag`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.getHashTags));
    router.get(`${apiVer}/games/tagged/:id`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.getHashTagById));
    router.get(`${apiVer}/games/s/:tag`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.getGameListByHashtag));
    router.get(`${apiVer}/games/ranking/g`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(rankingController_1.default.getGlobalRanking));
    router.get(`${apiVer}/games/ranking/f`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(rankingController_1.default.getFollowingRanking));
    // for testing
    router.get(`${apiVer}/sample-test`, (0, _convert_1.default)(gameController_1.default.sampleTest));
    router.get(`${apiVer}/cache-test`, (0, _convert_1.default)(gameController_1.default.cacheTest));
    router.get(`${apiVer}/cache-test2`, (0, _convert_1.default)(gameController_1.default.cacheTest2));
    router.post(`${apiVer}/test-badword`, (0, _convert_1.default)(gameController_1.default.tagTest));
    router.get(`${apiVer}/tag-test/search`, (0, _convert_1.default)(gameController_1.default.tagTest2));
    // deprecated
    router.post(`${apiVer}/game/start`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.gameStart));
    router.post(`${apiVer}/game/over`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.gameOver));
    router.get(`${apiVer}/battles/`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(battleController_1.default.getBattleList));
    router.get(`${apiVer}/battle/battle_id`, (0, _convert_1.default)(battleController_1.default.getInfo));
    router.post(`${apiVer}/battle/host`, (0, _convert_1.default)(battleController_1.default.hostBattle));
    router.post(`${apiVer}/battle/start`, (0, _convert_1.default)(battleController_1.default.gameStart));
    router.post(`${apiVer}/battle/over`, (0, _convert_1.default)(battleController_1.default.gameOver));
};
//# sourceMappingURL=gameRoute.js.map