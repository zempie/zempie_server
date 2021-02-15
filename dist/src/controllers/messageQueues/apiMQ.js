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
const _srvMQ_1 = require("./_srvMQ");
const globals_1 = require("../../commons/globals");
const sequelize_1 = require("sequelize");
class ApiMQ extends _srvMQ_1.SrvMQ {
    constructor() {
        super();
        this.game_emotion = {};
        this.game_ids = {};
        this.reply_reactions = {};
        this.processBulk = () => __awaiter(this, void 0, void 0, function* () {
            // 게임 오버 카운팅
            _.forEach(this.game_ids, (obj, id) => __awaiter(this, void 0, void 0, function* () {
                if (obj.count_over !== 0 || obj.count_heart !== 0) {
                    globals_1.dbs.Game.update({
                        count_over: sequelize_1.Sequelize.literal(`count_over + ${obj.count_over}`),
                        count_heart: sequelize_1.Sequelize.literal(`count_heart + ${obj.count_heart}`),
                    }, { id });
                    obj.count_over = 0;
                    obj.count_heart = 0;
                }
            }));
            // 게임 감정표현
            _.forEach(this.game_emotion, (obj, id) => __awaiter(this, void 0, void 0, function* () {
                if (_.some(obj, v => v != 0)) {
                    yield globals_1.dbs.GameEmotion.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                        let gameEmotion = yield globals_1.dbs.GameEmotion.findOne({ game_id: id }, transaction);
                        if (!gameEmotion) {
                            gameEmotion = yield globals_1.dbs.GameEmotion.create({ game_id: id }, transaction);
                        }
                        for (let e in obj) {
                            if (obj.hasOwnProperty(e)) {
                                gameEmotion[e] += obj[e];
                                obj[e] = 0;
                            }
                        }
                        yield gameEmotion.save({ transaction });
                    }));
                }
            }));
            // 댓글 리액션
            _.forEach(this.reply_reactions, (obj, id) => __awaiter(this, void 0, void 0, function* () {
                if (obj.count_good !== 0 || obj.count_bad !== 0) {
                    globals_1.dbs.GameReply.update({
                        count_good: sequelize_1.Sequelize.literal(`count_good + ${obj.count_good}`),
                        count_bad: sequelize_1.Sequelize.literal(`count_bad + ${obj.count_bad}`),
                    }, { id });
                    obj.count_good = 0;
                    obj.count_bad = 0;
                    delete this.reply_reactions[id];
                }
            }));
        });
        this.getGameIds = (id) => {
            return this.game_ids[id] = this.game_ids[id] || {
                count_over: 0,
                count_heart: 0,
            };
        };
        this.getGameEmotions = (id) => {
            return this.game_emotion[id] = this.game_emotion[id] || {
                e1: 0,
                e2: 0,
                e3: 0,
                e4: 0,
                e5: 0,
            };
        };
        this.getGameReplyReaction = (id) => {
            return this.reply_reactions[id] = this.reply_reactions[id] || {
                count_good: 0,
                count_bad: 0,
            };
        };
        this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.processBulk();
        }), 1000 * 10);
    }
    gameOver(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { game_id } = JSON.parse(message);
            const game = this.getGameIds(game_id);
            game.count_over += 1;
        });
    }
    gameHeart(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { game_id, activated } = JSON.parse(message);
            const game = this.getGameIds(game_id);
            game.count_heart += activated ? 1 : -1;
        });
    }
    gameEmotion(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { game_id, e_id, activated } = JSON.parse(message);
            const game = this.getGameEmotions(game_id);
            game[e_id] += activated ? 1 : -1;
        });
    }
    gameReplyReaction(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { reply_id, reaction } = JSON.parse(message);
            const reply = this.getGameReplyReaction(reply_id);
            reply.count_good += reaction.good;
            reply.count_bad += reaction.bad;
        });
    }
}
exports.default = new ApiMQ();
//# sourceMappingURL=apiMQ.js.map