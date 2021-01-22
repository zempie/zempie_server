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
const globals_1 = require("../../commons/globals");
const firebase_admin_1 = require("firebase-admin");
class AdminContentsController {
    constructor() {
        this.punishGame = ({ game_id, title, content }, _admin) => __awaiter(this, void 0, void 0, function* () {
            // make the game disabled
            const game = yield globals_1.dbs.Game.findOne({ id: game_id });
            game.enabled = false;
            game.save();
            // send a mail
            yield globals_1.dbs.UserMailbox.create({
                user_id: game.user_id,
                title,
                content,
            });
        });
        this.punishUser = ({ user_id, name, value, date }, _admin) => __awaiter(this, void 0, void 0, function* () {
            const userClaim = yield globals_1.dbs.UserClaim.find({ id: user_id });
            const claim = JSON.parse(userClaim.data);
            claim.zempie.deny[name] = {
                state: value,
                date,
                count: value ? claim.zempie.deny[name].count + 1 : 1,
            };
            userClaim.data = claim;
            userClaim.save();
            yield firebase_admin_1.default.auth().setCustomUserClaims(userClaim.user_uid, claim);
        });
    }
}
exports.default = new AdminContentsController();
//# sourceMappingURL=adminContentsController.js.map