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
class ContentMQ extends _srvMQ_1.SrvMQ {
    constructor() {
        super();
        this.game_over = {};
        this.processBulk = () => __awaiter(this, void 0, void 0, function* () {
            // const games = await caches.game.getList();
            _.forEach(this.game_over, (count, uid) => __awaiter(this, void 0, void 0, function* () {
                if (count > 0) {
                    globals_1.dbs.Game.update({
                        count_over: sequelize_1.Sequelize.literal(`count_over + ${count}`)
                    }, { uid });
                    this.game_over[uid] = 0;
                    console.log('[gameOver] uid:', uid);
                    // const game = _.find(games, game => game.game_uid === uid);
                    // if ( game ) {
                    //     game.count_over += count;
                    // }
                }
            }));
            // caches.game.setList(games);
        });
        this.interval = setInterval(() => {
            this.processBulk();
        }, 1000 * 10);
    }
    gameOver(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('message:'.yellow, message);
            const { user_uid, game_uid, score } = JSON.parse(message);
            // const user = await dbs.User.findOne({ id: user_id });
            // const game = await dbs.Game.findOne({ game_id });
            // const game_uid = game.uid;
            // await TimelineController.doPosting({type: eTimeline.PR, score, game_uid, game_id, user_id}, user);
            this.game_over[game_uid] = this.game_over[game_uid] || 0;
            this.game_over[game_uid] += 1;
            console.log('consume:', game_uid);
        });
    }
}
exports.default = new ContentMQ();
//# sourceMappingURL=contentMQ.js.map