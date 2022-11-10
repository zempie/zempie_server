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
const globals_1 = require("../commons/globals");
const errorCodes_1 = require("../commons/errorCodes");
const enums_1 = require("../commons/enums");
class AdController {
    onRewardedVideoCompleted({ pathname, pid }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield globals_1.dbs.Game.findOne({ title: pathname });
            if (!game) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_GAME_ID);
            }
            const { id: game_id, developer } = game;
            if (developer) {
                const user_id = developer;
                yield globals_1.dbs.GeneratedPointsLog.createAD({ user_id, game_id });
            }
            if (pid) {
                const pu = yield globals_1.dbs.User.findOne({ uid: pid });
                yield globals_1.dbs.UserPublishing.updateCount({ user_id: pu.id, game_id, pub_type: enums_1.ePubType.AD });
                yield globals_1.dbs.GeneratedPointsLog.createPoints({ user_id: pu.id, game_id, pub_type: enums_1.ePubType.AD });
            }
        });
    }
}
exports.default = new AdController();
//# sourceMappingURL=adController.js.map