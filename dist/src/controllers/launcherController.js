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
const uniqid = require("uniqid");
const globals_1 = require("../commons/globals");
const opt_1 = require("../../config/opt");
const _common_1 = require("./_common");
const { Url, Deploy } = opt_1.default;
class LauncherController {
    getGame({ pathname }) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield globals_1.caches.game.getByPathname(pathname);
            if (!ret) {
                const game = yield globals_1.dbs.Game.getInfo({ pathname });
                ret = {
                    game: _common_1.getGameData(game),
                };
                globals_1.caches.game.setByPathname(ret, pathname);
            }
            // const game = await dbs.Game.getInfo({ pathname });
            // const ret = {
            //     game: getGameData(game),
            // }
            return ret;
        });
    }
    getBattleGame({ uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield globals_1.caches.game.getBattle(uid);
            if (!ret) {
                const battle = yield globals_1.dbs.Battle.getInfo(uid);
                const { host, game } = battle;
                ret = {
                    battle_uid: battle.uid,
                    battle: {
                        uid: battle.uid,
                        title: battle.title,
                        user_count: battle.user_count,
                        end_at: battle.end_at,
                    },
                    game: _common_1.getGameData(game),
                    host: {
                        uid: host.uid,
                        name: host.name,
                        channel_id: host.channel_id,
                        picture: host.picture,
                    },
                };
                globals_1.caches.game.setBattle(ret, uid);
            }
            return ret;
        });
    }
    getSharedGame({ uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield globals_1.caches.game.getShared(uid);
            if (!ret) {
                const sg = yield globals_1.dbs.SharedGame.getInfo({ uid });
                const { game, user } = sg;
                ret = {
                    user: {
                        uid: user.uid,
                        name: user.name,
                        channel_id: user.channel_id,
                        picture: user.picture,
                    },
                    game: _common_1.getGameData(game),
                };
                globals_1.caches.game.setShared(ret, uid);
            }
            return ret;
        });
    }
    /**
     *
     */
    getSharedUrl({ game_id }, { uid: user_uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const uid = yield globals_1.dbs.SharedGame.getSharedUid({ user_uid, game_id });
            return {
                shared_uid: uid,
                shared_url: `${Url.Launcher}/shared/${uid}`
            };
        });
    }
    getBattleUrl({ game_id }, { uid: user_uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const uid = uniqid();
            yield globals_1.dbs.Battle.create({
                uid,
                user_uid,
                game_id,
                end_at: Date.now() + (1000 * 60 * 10),
            });
            return {
                battle_uid: uid,
                battle_url: `${Url.Launcher}/battle/${uid}`
            };
        });
    }
}
exports.default = new LauncherController();
//# sourceMappingURL=launcherController.js.map