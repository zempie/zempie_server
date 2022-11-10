"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpcController_1 = require("../controllers/rpcController");
const _common_1 = require("./_common");
const fileManager_1 = require("../services/fileManager");
const _convert_1 = require("../controllers/_convert");
const studioController_1 = require("../controllers/studio/studioController");
const adminStudioController_1 = require("../controllers/adminController/adminStudioController");
const bigQueryController_1 = require("../controllers/bigQueryController");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.post(`${apiVer}/studio/developer`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(studioController_1.default.signupDeveloper));
    router.post(`${apiVer}/studio/project`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, fileManager_1.default.uploadImage, (0, _convert_1.default)(studioController_1.default.createProject));
    router.get(`${apiVer}/studio/project`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, (0, _convert_1.default)(studioController_1.default.getProjects));
    router.get(`${apiVer}/studio/projects`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, (0, _convert_1.default)(studioController_1.default.getProjects2));
    router.get(`${apiVer}/studio/project/:id`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, (0, _convert_1.default)(studioController_1.default.getProject));
    router.post(`${apiVer}/studio/project/:id`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, fileManager_1.default.uploadImage, (0, _convert_1.default)(studioController_1.default.updateProject));
    router.delete(`${apiVer}/studio/project/:id`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, (0, _convert_1.default)(studioController_1.default.deleteProject));
    router.post(`${apiVer}/studio/version`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, fileManager_1.default.uploadImage, (0, _convert_1.default)(studioController_1.default.createVersion));
    router.delete(`${apiVer}/studio/version/:id`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, (0, _convert_1.default)(studioController_1.default.deleteVersion));
    router.get(`${apiVer}/studio/verify-pathname/:pathname`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, (0, _convert_1.default)(studioController_1.default.verifyGamePathname));
    // 설문조사
    router.post(`/gf/survey`, (0, _convert_1.default)(studioController_1.default.callbackSurvey));
    router.get(`${apiVer}/studio/survey`, _common_1.validateFirebaseIdToken, _common_1.isAuthenticated, _common_1.isDeveloper, (0, _convert_1.default)(studioController_1.default.getCurrentSurveyResult));
    router.get(`${apiVer}/bigquery/test`, (0, _convert_1.default)(bigQueryController_1.default.test));
};
rpcController_1.default.generator('admin-get-versions', adminStudioController_1.default.getVersions, true);
rpcController_1.default.generator('admin-get-version', adminStudioController_1.default.getVersion, true);
rpcController_1.default.generator('admin-set-version', adminStudioController_1.default.setVersion, true);
//# sourceMappingURL=studioRoute.js.map