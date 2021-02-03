"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const adminController_1 = require("../controllers/adminController/adminController");
const adminUserController_1 = require("../controllers/adminController/adminUserController");
const adminGameController_1 = require("../controllers/adminController/adminGameController");
const adminSupportController_1 = require("../controllers/adminController/adminSupportController");
const adminStudioController_1 = require("../controllers/adminController/adminStudioController");
const adminContentsController_1 = require("../controllers/adminController/adminContentsController");
const _common_1 = require("./_common");
const fileManager_1 = require("../services/fileManager");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.post(`${apiVer}/admin/login`, _convert_1.default(adminController_1.default.login));
    router.post(`${apiVer}/admin/logout`, _common_1.validateAdminIdToken, _convert_1.default(adminController_1.default.logout));
    router.post(`${apiVer}/admin/token`, _convert_1.default(adminController_1.default.getAccessTokens));
    router.get(`${apiVer}/admin/verify`, _common_1.validateAdminIdToken, _convert_1.default(adminController_1.default.verifyToken));
    /**
     * 관리자
     */
    router.get(`${apiVer}/admin/admin/logs`, _common_1.validateAdminIdToken, _convert_1.default(adminController_1.default.getAdminLogs));
    router.get(`${apiVer}/admin/admin/list`, _common_1.validateAdminIdToken, _convert_1.default(adminController_1.default.getAdmins));
    router.post(`${apiVer}/admin/admin/add`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminController_1.default.addAdmin));
    router.post(`${apiVer}/admin/admin/mod`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminController_1.default.updateAdmin));
    /**
     * 사용자
     */
    router.get(`${apiVer}/admin/user/list`, _common_1.validateAdminIdToken, _convert_1.default(adminUserController_1.default.getUsers));
    router.get(`${apiVer}/admin/user/profile`, _common_1.validateAdminIdToken, _convert_1.default(adminUserController_1.default.getUserProfile));
    router.post(`${apiVer}/admin/user/ban`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminUserController_1.default.banUser));
    /**
     * 게임
     */
    router.get(`${apiVer}/admin/games`, _common_1.validateAdminIdToken, _convert_1.default(adminGameController_1.default.getGames));
    router.post(`${apiVer}/admin/game/c/p`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminGameController_1.default.createProvidedGame));
    router.post(`${apiVer}/admin/game/u`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminGameController_1.default.updateGame));
    /**
     * 이용 제재
     */
    router.post(`${apiVer}/admin/punish/game`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminContentsController_1.default.punishGame));
    router.post(`${apiVer}/admin/punish/user`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminContentsController_1.default.punishUser));
    /**
     * 우편함
     */
    router.post(`${apiVer}/admin/send-mail`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminUserController_1.default.sendMail));
    router.post(`${apiVer}/admin/cancel-mail`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminUserController_1.default.cancelMail));
    /**
     * 고객지원
     */
    /**
     * 1:1 문의
     */
    router.get(`${apiVer}/admin/support/inquiry`, _common_1.validateAdminIdToken, _convert_1.default(adminSupportController_1.default.getUserInquiry));
    router.get(`${apiVer}/admin/support/inquiries`, _common_1.validateAdminIdToken, _convert_1.default(adminSupportController_1.default.getUserInquiries));
    router.post(`${apiVer}/admin/support/response`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminSupportController_1.default.respondInquiry));
    /**
     * 공지사항
     */
    router.get(`${apiVer}/admin/support/notices`, _common_1.validateAdminIdToken, _convert_1.default(adminSupportController_1.default.getNotices));
    router.post(`${apiVer}/admin/support/notice`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminSupportController_1.default.createNotice));
    router.post(`${apiVer}/admin/support/notice/mod`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminSupportController_1.default.updateNotice));
    router.post(`${apiVer}/admin/support/notice/del`, _common_1.validateAdminIdToken, _common_1.adminTracking, _convert_1.default(adminSupportController_1.default.deleteNotice));
    /**
     * FAQ
     */
    router.post(`${apiVer}/admin/support/faq`, _common_1.validateAdminIdToken, _common_1.adminTracking, fileManager_1.default.uploadImage2(3, 3), _convert_1.default(adminSupportController_1.default.createFAQ));
    /**
     * 비속어
     */
    router.get(`${apiVer}/admin/filter/bad-words`, _common_1.validateAdminIdToken, _convert_1.default(adminUserController_1.default.getBadWords));
    router.post(`${apiVer}/admin/filter/bad-word/c`, _common_1.validateAdminIdToken, _convert_1.default(adminUserController_1.default.addBadWord));
    router.post(`${apiVer}/admin/filter/bad-word/u`, _common_1.validateAdminIdToken, _convert_1.default(adminUserController_1.default.setBadWord));
    router.post(`${apiVer}/admin/filter/bad-word/d`, _common_1.validateAdminIdToken, _convert_1.default(adminUserController_1.default.delBadWord));
    // router.get(`${apiVer}/admin/projects`,      validateAdminIdToken,   convert(AdminGameController.getProjects));
    /**
     *
     */
    // router.post(`${apiVer}/admin/notify`,   validateAdminIdToken,    convert(AdminController.notify));
    /**
     * 스튜디오
     *
     */
    router.get(`${apiVer}/admin/studio/version`, _common_1.validateAdminIdToken, _convert_1.default(adminStudioController_1.default.getVersion));
    router.get(`${apiVer}/admin/studio/versions`, _common_1.validateAdminIdToken, _convert_1.default(adminStudioController_1.default.getVersions));
    router.post(`${apiVer}/admin/studio/version`, _common_1.validateAdminIdToken, _convert_1.default(adminStudioController_1.default.setVersion));
};
//# sourceMappingURL=adminRoute.js.map