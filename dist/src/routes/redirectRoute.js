"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redirectController_1 = require("../controllers/redirectController");
exports.default = (router) => {
    router.get(`/redirect/site/:url`, redirectController_1.default.site);
    router.get(`/redirect/play/:pathname`, redirectController_1.default.play);
    router.get(`/redirect/battle/:battle_uid`, redirectController_1.default.battle);
    router.get(`/redirect/shared/:shared_uid`, redirectController_1.default.shared);
    router.get(`/redirect/game/:pathname`, redirectController_1.default.game);
    router.get(`/redirect/community/:community_id/timeline`, redirectController_1.default.community);
    router.get(`/redirect/community/:community_id/members`, redirectController_1.default.members);
    router.get(`/redirect/user/:user_id/settings`, redirectController_1.default.user);
    // router.get('/test-php', ((req, res) => {
    //     res.send({state: 'good', name: 'raptor'})
    // }))
    // router.post('/test-php', ((req, res) => {
    //     const token = req.body;
    //     res.send({token})
    // }))
};
//# sourceMappingURL=redirectRoute.js.map