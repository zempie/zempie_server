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
const utils_1 = require("../../commons/utils");
class AdminGameController {
    constructor() {
        this.getGames = ({ limit = 50, offset = 0 }) => __awaiter(this, void 0, void 0, function* () {
            const games = yield globals_1.dbs.Game.findAll({}, {
                include: [{
                        model: globals_1.dbs.User.model,
                    }],
                order: [['id', 'asc']],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
            return {
                games: _.map(games, (game) => game.get({ plain: true }))
            };
        });
        this.updateGame = ({ game_id, official, enabled, activated, }) => __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.Game.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const game = yield globals_1.dbs.Game.findOne({ game_id }, transaction);
                if (!!official) {
                    game.official = utils_1.parseBoolean(official);
                }
                if (!!enabled) {
                    game.enabled = utils_1.parseBoolean(enabled);
                }
                if (!!activated) {
                    game.activated = utils_1.parseBoolean(activated);
                }
                yield game.save({ transaction });
            }));
        });
    }
}
exports.default = new AdminGameController();
//# sourceMappingURL=adminGameController.js.map