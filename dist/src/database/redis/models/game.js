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
const FeaturedKey = `zempie.game:featured`;
const PathnameKey = `zempie:game:p:`;
const ListKey = 'zempie:games:';
const GameKey = `zempie:game:g:`;
const BattleKey = `zempie:game:b:`;
const SharedKey = `zempie:game:s:`;
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
                this.redis.expire(ListKey + query, 60, () => { });
            });
        }
    }
    getByPathname(pathname) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield this.redis.get(PathnameKey + pathname);
            if (game) {
                return JSON.parse(game);
            }
            return game;
        });
    }
    setByPathname(ret, pathname) {
        this.redis.set(PathnameKey + pathname, JSON.stringify(ret), () => {
            this.redis.expire(PathnameKey + pathname, 60, () => { });
        });
    }
    /**
     * featured
     */
    getFeatured() {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield this.redis.get(FeaturedKey);
            if (ret) {
                return JSON.parse(ret);
            }
            return ret;
        });
    }
    setFeatured(ret) {
        this.redis.set(FeaturedKey, JSON.stringify(ret), () => {
            this.redis.expire(FeaturedKey, 60, () => { });
        });
    }
    /**
     * launcher - game (zempie)
     */
    getByUid(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield this.redis.get(GameKey + uid);
            if (ret) {
                return JSON.parse(ret);
            }
            return ret;
        });
    }
    setByUid(ret, uid) {
        this.redis.set(GameKey + uid, JSON.stringify(ret), () => {
            this.redis.expire(GameKey + uid, 60, () => { });
        });
    }
    /**
     * launcher - battle
     */
    getBattle(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield this.redis.get(BattleKey + uid);
            if (ret) {
                return JSON.parse(ret);
            }
            return ret;
        });
    }
    setBattle(ret, uid) {
        this.redis.set(BattleKey + uid, JSON.stringify(ret), () => {
            this.redis.expire(BattleKey + uid, 60 * 10, () => { });
        });
    }
    /**
     * launcher - shared
     */
    getShared(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield this.redis.get(SharedKey + uid);
            if (ret) {
                return JSON.parse(ret);
            }
            return ret;
        });
    }
    setShared(ret, uid) {
        this.redis.set(SharedKey + uid, JSON.stringify(ret), () => {
            this.redis.expire(SharedKey + uid, 60, () => { });
        });
    }
}
exports.default = new GameCache();
//# sourceMappingURL=game.js.map