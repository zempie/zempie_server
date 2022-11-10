"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import convert from '../controllers/_convert';
const _gameConvert_1 = require("../controllers/_gameConvert");
const gameAuthController_1 = require("../controllers/gameAuthController");
const _common_1 = require("./_common");
const apiVer = `/api/v1`;
exports.default = (router) => {
    //게임 토큰
    router.post(`${apiVer}/create/token`, (0, _gameConvert_1.default)(gameAuthController_1.default.createUserToken));
    router.post(`${apiVer}/verify/token`, (0, _gameConvert_1.default)(gameAuthController_1.default.verifyToken));
    //게임 서버 
    router.get(`${apiVer}/game/user/info`, _common_1.validateGameToken, (0, _gameConvert_1.default)(gameAuthController_1.default.getInfo));
    router.post(`${apiVer}/game/auth/access-token`, (0, _gameConvert_1.default)(gameAuthController_1.default.createGameToken));
    router.get(`${apiVer}/game/auth/verify-token`, (0, _gameConvert_1.default)(gameAuthController_1.default.verifyGameToken));
};
//# sourceMappingURL=gameAuthRoute.js.map