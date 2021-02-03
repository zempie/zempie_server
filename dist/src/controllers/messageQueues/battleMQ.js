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
class BattleMQ extends _srvMQ_1.SrvMQ {
    battleGameStart(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { battle_uid, battle_user_id } = message;
            // dbs.BattleLog.create({
            //     battle_uid,
            //     battle_user_id,
            //     score: -1
            // });
        });
    }
    battle_gameOver(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { battle_uid, user_uid, secret_id, best_score, score, new_record } = message;
            yield globals_1.dbs.BattleLog.updateScore({ id: secret_id, score });
            // if ( new_record ) {
            //     await dbs.BattleUser.updateBestScore({ battle_uid, user_uid, best_score: score });
            // }
            // timeline
        });
    }
}
exports.default = new BattleMQ();
//# sourceMappingURL=battleMQ.js.map