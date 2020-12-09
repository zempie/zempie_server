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
const _cache_1 = require("./_cache");
const Key = 'zempie:game:i:';
const ListKey = 'zempie:games:';
class GameCache extends _cache_1.default {
    constructor() {
        super(...arguments);
        this.name = 'game';
    }
    getList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const games = yield this.redis.get(ListKey + query);
            if (games) {
                return JSON.parse(games);
            }
            return null;
        });
    }
    setList(games, query = '') {
        if (games.length > 0) {
            this.redis.set(ListKey + query, JSON.stringify(games), () => {
                this.redis.expire(ListKey, 60, () => { });
            });
        }
    }
    get(pathname) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield this.redis.get(Key + pathname);
            if (game) {
                return JSON.parse(game);
            }
            return game;
        });
    }
    set(game) {
        this.redis.set(Key + game.pathname, JSON.stringify(game), () => {
            this.redis.expire(Key + game.pathname, 60, () => { });
        });
    }
}
exports.default = new GameCache();
//# sourceMappingURL=game.js.map