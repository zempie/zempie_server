"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tcpController_1 = require("../controllers/tcp/tcpController");
exports.default = (router) => {
    router.ws(`/tcp/:pathname`, tcpController_1.default.connected);
    router.ws(`/tcp/:pathname/:num`, tcpController_1.default.connected);
};
//# sourceMappingURL=tcpRoute.js.map