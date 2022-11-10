"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const communityController_1 = require("../controllers/communityController");
const googleController_1 = require("../controllers/googleController");
const _common_1 = require("./_common");
const gameController_1 = require("../controllers/game/gameController");
const fileManager_1 = require("../services/fileManager");
const apiVer = `/api/v1`;
exports.default = (router) => {
    //커뮤니티
    router.get(`${apiVer}/community/project/:id`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(communityController_1.default.getProject));
    router.get(`${apiVer}/community/channel/:channel_id`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(communityController_1.default.getTargetInfoByChannelId));
    router.get(`${apiVer}/community/user/:user_id`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(communityController_1.default.getTargetInfoByUserId));
    //번역
    router.post(`${apiVer}/translate`, (0, _convert_1.default)(googleController_1.default.translateText));
    router.post(`${apiVer}/detect-lang`, (0, _convert_1.default)(googleController_1.default.detectLanguage));
    //게임 페이지
    router.post(`${apiVer}/game/banner`, _common_1.validateFirebaseIdToken, fileManager_1.default.uploadFiles(40, 40), (0, _convert_1.default)(gameController_1.default.setBanner));
    router.put(`${apiVer}/game/banner`, _common_1.validateFirebaseIdToken, fileManager_1.default.uploadFiles(40, 40), (0, _convert_1.default)(gameController_1.default.updateBanner));
    router.delete(`${apiVer}/game/banner`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(gameController_1.default.deleteBanner));
    //og tag
    router.get(`${apiVer}/og-tag`, (0, _convert_1.default)(communityController_1.default.getOgTag));
};
//# sourceMappingURL=communityRoute.js.map