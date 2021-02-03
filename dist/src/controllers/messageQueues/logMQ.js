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
class LogMQ extends _srvMQ_1.SrvMQ {
    gameOver(message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[log]', message);
            // const { user_id, game_id, score }: any = message;
            // await dbs.GameLog.create({
            //     user_id,
            //     game_id,
            //     score
            // });
        });
    }
}
exports.default = new LogMQ();
//# sourceMappingURL=logMQ.js.map