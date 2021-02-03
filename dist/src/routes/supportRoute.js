"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const _common_1 = require("./_common");
const supportController_1 = require("../controllers/supportController");
const fileManager_1 = require("../services/fileManager");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.get(`${apiVer}/support/notices`, _convert_1.default(supportController_1.default.getNotices));
    router.get(`${apiVer}/support/notice/:id`, _convert_1.default(supportController_1.default.getNotice));
    // router.get(`${apiVer}/support/faq`,             convert(SupportController.getFaq));
    router.get(`${apiVer}/support/inquiries`, _common_1.validateFirebaseIdToken, _convert_1.default(supportController_1.default.getMyInquiries));
    router.get(`${apiVer}/support/inquiry/:id`, _common_1.validateFirebaseIdToken, _convert_1.default(supportController_1.default.getMyInquiry));
    router.post(`${apiVer}/support/inquiry`, _common_1.validateFirebaseIdToken, fileManager_1.default.uploadImage2(5, 5), _convert_1.default(supportController_1.default.askInquiry));
};
//# sourceMappingURL=supportRoute.js.map