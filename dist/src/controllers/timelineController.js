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
exports.checkTimeline = void 0;
const _ = require("lodash");
const uniqid = require("uniqid");
const globals_1 = require("../commons/globals");
const enums_1 = require("../commons/enums");
const errorCodes_1 = require("../commons/errorCodes");
class TimelineController {
    getList({ user_uid, limit = 50, offset = 0 }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            user_uid = user_uid || user.uid;
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user_uid });
            if (!userRecord) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_USER_UID);
            }
            const user_id = userRecord.id;
            const timeline = yield globals_1.dbs.Timeline.getList({ user_id, limit, offset });
            // const games = await gameCache.get();
            return {
                timeline: _.map(timeline, (t) => {
                    return {
                        id: t.id,
                        type: t.type,
                        extra: JSON.parse(t.extra),
                        created_at: t.created_at,
                        user: t.user,
                        // game: _.find(games, (g: any) => g.game_uid === t.game_uid),
                        game: t.game,
                    };
                })
            };
        });
    }
    doPosting({ type, score, follower_ids, game_uid, game_id, user_id, achievement_id, battle_id }, user, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const uid = uniqid();
            let extra;
            switch (type) {
                case enums_1.eTimeline.PR:
                    extra = JSON.stringify({ score });
                    break;
                case enums_1.eTimeline.PRW:
                    extra = JSON.stringify({ score, follower_ids });
                    break;
                case enums_1.eTimeline.Share:
                    extra = JSON.stringify({ game_uid });
                    break;
                case enums_1.eTimeline.Achievement:
                    extra = JSON.stringify({ achievement_id });
                    break;
                case enums_1.eTimeline.Battle_1st:
                    extra = JSON.stringify({ battle_id });
                    break;
            }
            const posting = yield globals_1.dbs.Timeline.create({
                uid,
                user_id,
                game_id,
                type,
                extra
            }, transaction);
            return {
                posting: {
                    id: posting.id,
                    uid,
                    type: posting.type,
                }
            };
        });
    }
    deletePosting({ uid }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.Timeline.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const posting = yield globals_1.dbs.Timeline.findOne({ uid }, transaction);
                if (!posting) {
                    throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_TIMELINE_USER_UID);
                }
                if (posting.user_uid !== user.uid) {
                    throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_TIMELINE_USER_UID);
                }
                yield posting.destroy({ transaction });
            }));
        });
    }
}
exports.default = new TimelineController();
function checkTimeline() {
}
exports.checkTimeline = checkTimeline;
//# sourceMappingURL=timelineController.js.map