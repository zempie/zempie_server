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
const { Url, Deploy } = opt_1.default;
class LauncherController {
    getGame({ uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield globals_1.dbs.Game.getInfo(uid);
            return {
                game
            };
        });
    }
    getBattleGame({ uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const battle = yield globals_1.dbs.Battle.getInfo(uid);
            return {
                battle_uid: battle.uid,
                battle: {
                    uid: battle.uid,
                    title: battle.title,
                    user_count: battle.user_count,
                    end_at: battle.end_at,
                },
                game: battle.game,
                host: battle.host,
            };
        });
    }
    getSharedGame({ uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const sg = yield globals_1.dbs.SharedGame.getInfo(uid);
            return {
                game: sg.game,
            };
        });
    }
    /**
     *
     */
    getSharedUrl({ game_uid }, { uid: user_uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const uid = yield globals_1.dbs.SharedGame.getSharedUid({ user_uid, game_uid });
            return {
                shared_uid: uid,
                shared_url: `${Url.Launcher}/shared/${uid}`
            };
        });
    }
    getBattleUrl({ game_uid }, { uid: user_uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const uid = uniqid();
            yield globals_1.dbs.Battle.create({
                uid,
                user_uid,
                game_uid,
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