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
        this.processBulk = () => __awaiter(this, void 0, void 0, function* () {
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
            _.forEach(this.game_emotion, (obj, id) => __awaiter(this, void 0, void 0, function* () {
                if (_.some(obj, v => v != 0)) {
                    yield globals_1.dbs.GameEmotion.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                        let gameEmotion = yield globals_1.dbs.GameEmotion.findOne({ id }, transaction);
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
        this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.processBulk();
        }), 1000 * 10);
    }
    gameOver(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_uid, game_id, score } = JSON.parse(message);
            const game = this.getGameIds(game_id);
            game.count_over += 1;
        });
    }
    gameHeart(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_uid, game_id, activated } = JSON.parse(message);
            const game = this.getGameIds(game_id);
            game.count_heart += activated ? 1 : -1;
        });
    }
    gameEmotion(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { game_id, emotion, activated } = JSON.parse(message);
            const game = this.getGameEmotions(game_id);
            game[emotion] += activated ? 1 : -1;
        });
    }
}
exports.default = new ApiMQ();
//# sourceMappingURL=apiMQ.js.map