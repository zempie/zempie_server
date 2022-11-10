"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const _common_1 = require("./_common");
const fileManager_1 = require("../services/fileManager");
const timelineController_1 = require("../controllers/timelineController");
const noticeController_1 = require("../controllers/noticeController");
// import SocialMediaController from '../controllers/socialMediaControlller';
const communityController_1 = require("../controllers/communityController");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.get(`${apiVer}/timeline`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(timelineController_1.default.getList));
    router.get(`${apiVer}/notice`, _common_1.validateFirebaseIdToken, (0, _convert_1.default)(noticeController_1.default.getList));
    // social media - follow
    // router.post(`${apiVer}/sm/follow`,      validateFirebaseIdToken,    convert(SocialMediaController.follow));
    // router.post(`${apiVer}/sm/un-follow`,   validateFirebaseIdToken,    convert(SocialMediaController.unFollow));
    // router.get(`${apiVer}/sm/following`,    validateFirebaseIdToken,    convert(SocialMediaController.following));
    // router.get(`${apiVer}/sm/followers`,    validateFirebaseIdToken,    convert(SocialMediaController.followers));
    // social media - DM ( direct message )
    router.post(`${apiVer}/dm/send`);
    router.get(`${apiVer}/dm/list`);
    // for community
    router.post(`${apiVer}/community/att`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, fileManager_1.default.uploadFiles(200, 40), (0, _convert_1.default)(communityController_1.default.uploadFile));
    router.post(`${apiVer}/community/att/i`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, fileManager_1.default.uploadFiles(20, 4), (0, _convert_1.default)(communityController_1.default.uploadFile));
    router.post(`${apiVer}/community/att/a`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, fileManager_1.default.uploadFiles(40, 8), (0, _convert_1.default)(communityController_1.default.uploadFile));
    router.post(`${apiVer}/community/att/v`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, fileManager_1.default.uploadFiles(40, 40), (0, _convert_1.default)(communityController_1.default.uploadFile));
};
//# sourceMappingURL=contentRoute.js.map