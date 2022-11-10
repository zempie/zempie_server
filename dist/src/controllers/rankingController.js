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
const sequelize_1 = require("sequelize");
const globals_1 = require("../commons/globals");
const _ = require("lodash");
class RankingController {
    constructor() {
        this.getGlobalRanking = ({ game_id, limit = 50, offset = 0 }, user) => __awaiter(this, void 0, void 0, function* () {
            let score, rank;
            // const userRecord = await dbs.User.findOne({ uid });
            // const game = await dbs.Game.findOne({ uid: game_uid });
            // if ( !game ) {
            //     throw CreateError(ErrorCodes.INVALID_GAME_UID);
            // }
            //
            // const user_id = userRecord.id;
            // const game_id = game.id;
            if (user && user.uid) {
                const gameRecord = yield globals_1.dbs.UserGame.findOne({ game_id, user_uid: user.uid });
                if (gameRecord) {
                    score = gameRecord.score;
                    rank = yield globals_1.dbs.UserGame.model.count({
                        where: {
                            game_id,
                            score: {
                                [sequelize_1.Op.gt]: score
                            },
                        },
                        order: [['score', 'desc']],
                    });
                    rank += 1;
                }
            }
            const { count, rows } = yield globals_1.dbs.UserGame.model.findAndCountAll({
                where: { game_id },
                include: [{
                        model: globals_1.dbs.User.model,
                        required: true,
                    }],
                attributes: {
                    include: [
                        [sequelize_1.Sequelize.literal('(RANK() OVER (ORDER BY score DESC))'), 'rank'],
                    ],
                },
                limit,
                offset
            });
            return {
                count,
                rank,
                score,
                list: _.map(rows, (record) => {
                    const { rank, user, score } = record.get({ plain: true });
                    return {
                        rank,
                        user_uid: user.uid,
                        name: user.name,
                        picture: user.picture,
                        channel_id: user.channel_id,
                        score,
                    };
                })
            };
        });
        this.getFollowingRanking = ({ game_id, limit = 50, offset = 0 }, { uid: user_uid }, transaction) => __awaiter(this, void 0, void 0, function* () {
            let score, rank;
            const gameRecord = yield globals_1.dbs.UserGame.findOne({ game_id, user_uid }, transaction);
            if (gameRecord) {
                score = gameRecord.score;
                rank = yield globals_1.dbs.Follow.model.count({
                    where: { user_uid },
                    include: [{
                            model: globals_1.dbs.UserGame.model,
                            as: 'gameRecord',
                            where: {
                                game_id,
                                score: {
                                    [sequelize_1.Op.gt]: score,
                                }
                            }
                        }],
                });
                rank += 1;
            }
            const { count, rows } = yield globals_1.dbs.Follow.model.findAndCountAll({
                where: { user_uid },
                include: [{
                        model: globals_1.dbs.UserGame.model,
                        as: 'gameRecord',
                        where: { game_id },
                    }, {
                        model: globals_1.dbs.User.model,
                        as: 'target',
                        required: true,
                    }],
                attributes: {
                    include: [
                        [sequelize_1.Sequelize.literal('(RANK() OVER (ORDER BY gameRecord.score DESC))'), 'rank'],
                    ]
                },
                limit, offset, transaction
            });
            return {
                count,
                rank,
                score,
                list: _.map(rows, (record) => {
                    const { rank, target, gameRecord } = record.get({ plain: true });
                    return {
                        rank,
                        user_uid: target.uid,
                        name: target.name,
                        picture: target.picture,
                        score: gameRecord.score,
                    };
                })
            };
        });
    }
}
exports.default = new RankingController();
//# sourceMappingURL=rankingController.js.map