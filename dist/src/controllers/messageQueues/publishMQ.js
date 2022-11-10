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
const _srvMQ_1 = require("./_srvMQ");
const globals_1 = require("../../commons/globals");
const enums_1 = require("../../commons/enums");
const errorCodes_1 = require("../../commons/errorCodes");
class PublishMQ extends _srvMQ_1.SrvMQ {
    gameOver(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pid, game_id, } = message;
            if (pid) {
                const pu = yield globals_1.dbs.User.findOne({ uid: pid });
                // const game = await dbs.Game.findOne({ id: game_id });
                // const { id: game_id } = game;
                yield globals_1.dbs.UserPublishing.updateCount({ user_id: pu.id, game_id, pub_type: enums_1.ePubType.PubGamePlay });
                yield globals_1.dbs.GeneratedPointsLog.createPoints({ user_id: pu.id, game_id, pub_type: enums_1.ePubType.PubGamePlay });
            }
        });
    }
    pub_PlayGame(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pathname, user_uid } = message;
            const game = yield globals_1.dbs.Game.findOne({ title: pathname });
            if (!game) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_GAME_ID);
            }
            return globals_1.dbs.User.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user = yield globals_1.dbs.User.findOne({ uid: user_uid }, transaction);
                if (!user) {
                    throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_USER_UID);
                }
                yield globals_1.dbs.UserPublishing.updateCount({ user_id: user.id, game_id: game.id, pub_type: enums_1.ePubType.Open }, transaction);
            }));
        });
    }
}
exports.default = new PublishMQ();
//# sourceMappingURL=publishMQ.js.map