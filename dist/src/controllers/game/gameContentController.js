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
const globals_1 = require("../../commons/globals");
const errorCodes_1 = require("../../commons/errorCodes");
const messageQueueService_1 = require("../../services/messageQueueService");
class GameContentController {
    constructor() {
        this.heart = ({ game_id, heart_on }, user) => __awaiter(this, void 0, void 0, function* () {
            const user_uid = user.uid;
            const game = yield globals_1.dbs.Game.findOne({ id: game_id });
            if (!game) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_GAME_ID);
            }
            const changed = yield globals_1.dbs.GameHeart.likeIt(game_id, user_uid, heart_on);
            if (changed) {
                messageQueueService_1.default.send({
                    topic: 'gameHeart',
                    messages: [{
                            value: JSON.stringify({
                                user_uid,
                                game_id,
                                activated: heart_on,
                            })
                        }]
                });
            }
            return {
                heart_on,
            };
        });
        this.emotion = ({ game_id, emotion, on }, user) => __awaiter(this, void 0, void 0, function* () {
            const user_uid = user.uid;
            const game = yield globals_1.dbs.Game.findOne({ id: game_id });
            if (!game) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_GAME_ID);
            }
            const changed = yield globals_1.dbs.UserGameEmotion.feelLike(game_id, user_uid, emotion, on);
            if (changed) {
                messageQueueService_1.default.send({
                    topic: 'gameEmotion',
                    messages: [{
                            value: JSON.stringify({
                                user_uid,
                                game_id,
                                emotion,
                                activated: on,
                            })
                        }]
                });
            }
            return {
                emotion_on: on,
            };
        });
        this.createOrUpdateChallengingReport = ({ game_id, rating, comment }, user) => __awaiter(this, void 0, void 0, function* () {
            return yield globals_1.dbs.GameChallengingReport.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                let report = yield globals_1.dbs.GameChallengingReport.findOne({ user_uid: user.uid, game_id }, transaction);
                if (report) {
                    report.rating = rating;
                    report.comment = comment;
                    yield report.save({ transaction });
                }
                else {
                    report = yield globals_1.dbs.GameChallengingReport.create({ user_uid: user.uid, game_id, rating, comment }, transaction);
                }
            }));
        });
        this.getReports = ({ game_id, limit = 50, offset = 0 }, user) => __awaiter(this, void 0, void 0, function* () {
            const reports = yield globals_1.dbs.GameChallengingReport.findAll({ game_id }, {
                include: [{
                        model: globals_1.dbs.User.model,
                    }],
                order: [['id', 'asc']],
                limit,
                offset,
            });
            return {
                reports: _.map(reports, (report) => {
                    return {
                        rating: report.rating,
                        comment: report.comment,
                        user: {
                            uid: report.user.uid,
                            name: report.user.name,
                            picture: report.user.picture,
                        }
                    };
                })
            };
        });
    }
}
exports.default = new GameContentController();
//# sourceMappingURL=gameContentController.js.map