"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const _common_1 = require("./_common");
const userController_1 = require("../controllers/userController");
const alarmController_1 = require("../controllers/alarmController");
const fileManager_1 = require("../services/fileManager");
const publishingController_1 = require("../controllers/publishingController");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.get(`${apiVer}/__cookie`, _convert_1.default(userController_1.default.setCookie));
    router.get(`${apiVer}/user/verify-session`, _convert_1.default(userController_1.default.getCustomToken));
    router.post(`${apiVer}/user/sign-up`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.signUp));
    router.post(`${apiVer}/user/sign-out`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.signOut));
    router.post(`${apiVer}/user/leave-zempie`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.leaveZempie));
    router.post(`${apiVer}/user/verify-email`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.verifyEmail));
    router.post(`${apiVer}/user/verify-channel`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.verifyChannelId));
    router.post(`${apiVer}/user/update/info`, _common_1.validateFirebaseIdToken, fileManager_1.default.uploadImage, _convert_1.default(userController_1.default.setInfo));
    router.post(`${apiVer}/user/update/banner`, _common_1.validateFirebaseIdToken, fileManager_1.default.uploadImage, _convert_1.default(userController_1.default.setBanner));
    router.post(`${apiVer}/user/update/setting`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.updateSetting));
    router.post(`${apiVer}/user/update/e-link`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.updateExternalLink));
    router.post(`${apiVer}/user/delete/e-link`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.deleteExternalLink));
    router.get(`${apiVer}/user/info`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.getInfo));
    router.get(`${apiVer}/channel/:channel_id`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.getTargetInfoByChannelId));
    router.get(`${apiVer}/user/search`, _common_1.validateFirebaseIdToken, _convert_1.default(userController_1.default.searchUser));
    router.get(`${apiVer}/user/alarm`, _common_1.validateFirebaseIdToken, _convert_1.default(alarmController_1.default.getList));
    router.get(`${apiVer}/user/publishing`, _common_1.validateFirebaseIdToken, _convert_1.default(publishingController_1.default.getList));
};
//# sourceMappingURL=userRoute.js.map