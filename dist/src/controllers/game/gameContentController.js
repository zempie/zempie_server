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
const enums_1 = require("../../commons/enums");
class GameContentController {
    constructor() {
        this.heart = ({ game_id, on }, user) => __awaiter(this, void 0, void 0, function* () {
            const user_uid = user.uid;
            const game = yield globals_1.dbs.Game.findOne({ id: game_id });
            if (!game) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_GAME_ID);
            }
            const changed = yield globals_1.dbs.GameHeart.likeIt(game_id, user_uid, on);
            if (changed) {
                globals_1.caches.game.delByPathname(game.pathname, user_uid);
                messageQueueService_1.default.send({
                    topic: 'gameHeart',
                    messages: [{
                            value: JSON.stringify({
                                user_uid,
                                game_id,
                                activated: on,
                            })
                        }]
                });
            }
            return {
                heart_on: on,
            };
        });
        this.emotion = ({ game_id, e_id, on }, user) => __awaiter(this, void 0, void 0, function* () {
            const user_uid = user.uid;
            const game = yield globals_1.dbs.Game.findOne({ id: game_id });
            if (!game) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_GAME_ID);
            }
            const changed = yield globals_1.dbs.UserGameEmotion.feelLike(game_id, user_uid, e_id, on);
            if (changed) {
                globals_1.caches.game.delByPathname(game.pathname, user_uid);
                messageQueueService_1.default.send({
                    topic: 'gameEmotion',
                    messages: [{
                            value: JSON.stringify({
                                user_uid,
                                game_id,
                                e_id,
                                activated: on,
                            })
                        }]
                });
            }
            return {
                emotion_on: on,
            };
        });
        /**
         * 댓글
         */
        this.getRetReplies = (replies) => __awaiter(this, void 0, void 0, function* () {
            return {
                replies: _.map(replies, (r) => {
                    const { user } = r;
                    return {
                        id: r.id,
                        content: r.content,
                        count_good: r.count_good,
                        count_bad: r.count_bad,
                        user: {
                            uid: user.uid,
                            name: user.name,
                            picture: user.picture,
                            channel_id: user.channel_id,
                        }
                    };
                })
            };
        });
        // 댓글
        this.getReplies = ({ game_id, limit, offset }) => __awaiter(this, void 0, void 0, function* () {
            const replies = yield globals_1.dbs.GameReply.getReplies(game_id, { limit, offset });
            return this.getRetReplies(replies);
        });
        // 대댓글
        this.getReReplies = ({ reply_id, limit, offset }) => __awaiter(this, void 0, void 0, function* () {
            const replies = yield globals_1.dbs.GameReply.getReReplies(reply_id, { limit, offset });
            return this.getRetReplies(replies);
        });
        // 댓글 쓰기
        this.leaveReply = ({ game_id, reply_id, content }, user) => __awaiter(this, void 0, void 0, function* () {
            // 불량 단어 색출
            if (!globals_1.dbs.BadWords.isOk(content)) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.FORBIDDEN_STRING);
            }
            yield globals_1.dbs.GameReply.create({
                game_id,
                user_uid: user.uid,
                parent_reply_id: reply_id || null,
                content,
            });
            if (reply_id) {
                // 알림?
            }
        });
        // 댓글 좋아, 싫어
        this.reactReply = ({ reply_id, reaction }, user) => __awaiter(this, void 0, void 0, function* () {
            reaction = _.toNumber(reaction);
            let changed = false;
            let r = { good: 0, bad: 0 };
            const record = yield globals_1.dbs.UserGameReplyReaction.findOne({ reply_id, user_uid: user.uid });
            if (record) {
                if (record.reaction !== reaction) {
                    record.reaction = reaction;
                    record.save();
                    changed = true;
                    if (record.reaction === enums_1.eReplyReaction.good) {
                        r.good = -1;
                    }
                    else if (record.reaction === enums_1.eReplyReaction.bad) {
                        r.bad = -1;
                    }
                    if (reaction === enums_1.eReplyReaction.good) {
                        r.good += 1;
                    }
                    else if (reaction === enums_1.eReplyReaction.bad) {
                        r.bad += 1;
                    }
                }
            }
            else {
                yield globals_1.dbs.UserGameReplyReaction.create({ reply_id, user_uid: user.uid, reaction });
                changed = true;
                if (reaction === enums_1.eReplyReaction.good) {
                    r.good += 1;
                }
                else if (reaction === enums_1.eReplyReaction.bad) {
                    r.bad += 1;
                }
            }
            if (changed) {
                messageQueueService_1.default.send({
                    topic: 'gameReplyReaction',
                    messages: [{
                            value: JSON.stringify({
                                reply_id,
                                reaction: r,
                            })
                        }]
                });
            }
            return { reaction };
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