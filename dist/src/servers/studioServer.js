"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const userRoute_1 = require("../routes/userRoute");
const studioRoute_1 = require("../routes/studioRoute");
const globals_1 = require("../commons/globals");
const firebase_admin_1 = require("firebase-admin");
const redirectRoute_1 = require("../routes/redirectRoute");
class StudioServer extends server_1.default {
    constructor() {
        super(...arguments);
        this.initialize = (options) => __awaiter(this, void 0, void 0, function* () {
            this.options = options;
            this.setExpress(options);
            this.setFirebase();
            yield this.setRDB();
            yield this.setMDB();
            // await this.setDeveloper();
        });
    }
    routes(app) {
        super.routes(app);
        // adminRoute(app);
        (0, userRoute_1.default)(app);
        (0, studioRoute_1.default)(app);
        // contentRoute(app);
        // gameRoute(app);
        (0, redirectRoute_1.default)(app);
    }
    setDeveloper() {
        return __awaiter(this, void 0, void 0, function* () {
            const developers = yield globals_1.dbs.User.findAll({ is_developer: true });
            for (let i = 0; i < developers.length; i++) {
                const user = developers[i];
                const userClaim = yield globals_1.dbs.UserClaim.getZempieClaim(user.id, user.uid);
                const claim = JSON.parse(userClaim.data);
                claim.zempie.is_developer = true;
                userClaim.data = claim;
                yield userClaim.save();
                try {
                    yield firebase_admin_1.default.auth().setCustomUserClaims(userClaim.user_uid, claim);
                    console.log(claim);
                }
                catch (e) {
                    console.error(e.message);
                }
            }
        });
    }
}
exports.default = StudioServer;
//# sourceMappingURL=studioServer.js.map