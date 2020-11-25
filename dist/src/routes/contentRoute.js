"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _convert_1 = require("../controllers/_convert");
const _common_1 = require("./_common");
const timelineController_1 = require("../controllers/timelineController");
const noticeController_1 = require("../controllers/noticeController");
const socialMediaControlller_1 = require("../controllers/socialMediaControlller");
const rpcController_1 = require("../controllers/rpcController");
const apiVer = `/api/v1`;
exports.default = (router) => {
    router.get(`${apiVer}/timeline`, _common_1.validateFirebaseIdToken, _convert_1.default(timelineController_1.default.getList));
    router.get(`${apiVer}/notice`, _common_1.validateFirebaseIdToken, _convert_1.default(noticeController_1.default.getList));
    // social media - follow
    router.post(`${apiVer}/sm/follow`, _common_1.validateFirebaseIdToken, _convert_1.default(socialMediaControlller_1.default.follow));
    router.post(`${apiVer}/sm/un-follow`, _common_1.validateFirebaseIdToken, _convert_1.default(socialMediaControlller_1.default.unFollow));
    router.get(`${apiVer}/sm/following`, _common_1.validateFirebaseIdToken, _convert_1.default(socialMediaControlller_1.default.following));
    router.get(`${apiVer}/sm/followers`, _common_1.validateFirebaseIdToken, _convert_1.default(socialMediaControlller_1.default.followers));
    // social media - DM ( direct message )
    router.post(`${apiVer}/dm/send`);
    router.get(`${apiVer}/dm/list`);
};
rpcController_1.default.generator('get-timeline', timelineController_1.default.getList, true);
rpcController_1.default.generator('get-notices', noticeController_1.default.getList, true);
rpcController_1.default.generator('follow', socialMediaControlller_1.default.follow, true);
rpcController_1.default.generator('unfollow', socialMediaControlller_1.default.unFollow, true);
rpcController_1.default.generator('get-following', socialMediaControlller_1.default.following, true);
rpcController_1.default.generator('get-followers', socialMediaControlller_1.default.followers, true);
//# sourceMappingURL=contentRoute.js.map