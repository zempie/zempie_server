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
const _ = require("lodash");
const globals_1 = require("../commons/globals");
class AlarmController {
    constructor() {
        this.getList = ({ limit = 50, offset = 0 }, user) => __awaiter(this, void 0, void 0, function* () {
            const alarms = yield globals_1.dbs.Alarm.getList({ user_uid: user.uid, limit, offset });
            // const games = await gameCache.get();
            const games = yield globals_1.dbs.Game.findAll({});
            return {
                alarms: _.map(alarms, (alarm) => {
                    const extra = JSON.parse(alarm.extra);
                    if (extra.game_uid) {
                        extra.game = _.find(games, (g) => g.uid === extra.game_uid);
                    }
                    return {
                        id: alarm.id,
                        type: alarm.type,
                        extra,
                        created_at: alarm.created_at,
                        target: alarm.target,
                    };
                })
            };
        });
    }
}
exports.default = new AlarmController();
//# sourceMappingURL=alarmController.js.map