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
const utils_1 = require("../commons/utils");
const errorCodes_1 = require("../commons/errorCodes");
const messageQueueService_1 = require("../services/messageQueueService");
class BattleController {
    constructor() {
        this.getBattleList = () => __awaiter(this, void 0, void 0, function* () {
        });
        this.getInfo = ({ battle_uid }) => __awaiter(this, void 0, void 0, function* () {
            const battle = yield globals_1.dbs.Battle.get({ battle_uid });
            const { user: host, game } = battle;
            return {
                battle_uid: battle.uid,
                host,
                game,
                battle: {
                    end_at: battle.end_at,
                },
            };
        });
        this.hostBattle = ({ game_id, is_infinity }, user) => __awaiter(this, void 0, void 0, function* () {
            const uid = uniqid();
            yield globals_1.dbs.Battle.create({
                uid,
                user_uid: user.uid,
                game_id,
                // end_at: is_infinity ? null : new Date()
                end_at: Date.now() + (1000 * 60 * 10)
            });
            return {
                battle_uid: uid,
                share_url: `http://localhost:8280/battle/${uid}`
            };
        });
        this.gameStart = ({ battle_uid, battle_key }, user) => __awaiter(this, void 0, void 0, function* () {
            const battle = yield globals_1.dbs.Battle.findOne({ uid: battle_uid });
            if (!battle) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_BATTLE);
            }
            if (new Date(battle.end_at) < new Date()) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.BATTLE_OVER);
            }
            // battle.user_count += 1;
            // await battle.save({transaction});
            let decoded = battle_key && battle_key !== '' ? utils_1.verifyJWT(battle_key) : {
                user_uid: uniqid(),
                best_score: -1
            };
            let user_uid = user ? user.uid : decoded.user_uid;
            const { record: battle_user, isNew } = yield globals_1.dbs.BattleUser.findOrCreate({
                battle_uid,
                user_uid,
            }, undefined);
            decoded.best_score = battle_user.best_score;
            const record = yield globals_1.dbs.BattleLog.create({
                battle_uid,
                battle_user_id: battle_user.id,
                score: -1
            });
            const new_battle_key = utils_1.signJWT({
                uid: battle_uid,
                game_id: battle.game_id,
                user_uid,
                secret_id: record.id,
                best_score: decoded.best_score,
            }, '10m');
            return {
                battle_key: new_battle_key,
                user_uid
            };
        });
        this.gameOver = ({ battle_key, score }, user) => __awaiter(this, void 0, void 0, function* () {
            const decoded = utils_1.verifyJWT(battle_key);
            const { uid: battle_uid, game_id, user_uid, secret_id, best_score } = decoded;
            const new_record = score > best_score;
            if (new_record) {
                yield globals_1.dbs.BattleUser.updateBestScore({ battle_uid, user_uid, best_score: score });
            }
            messageQueueService_1.default.send({
                topic: 'battle_gameOver',
                messages: [{
                        value: JSON.stringify({
                            battle_uid,
                            user_uid,
                            secret_id,
                            best_score,
                            score,
                            new_record,
                        })
                    }]
            });
            return {
                new_record
            };
        });
        this.updateUserName = ({ battle_key, name }, user) => __awaiter(this, void 0, void 0, function* () {
            // 불량 단어 색출
            if (!!name && !globals_1.dbs.BadWords.isOk(name)) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.FORBIDDEN_STRING);
            }
            const decoded = utils_1.verifyJWT(battle_key);
            const { uid: battle_uid, game_id, user_uid, secret_id, best_score } = decoded;
            yield globals_1.dbs.BattleUser.updateUserName({ battle_uid, user_uid, name });
        });
        this.getRanking = ({ battle_uid }, user) => __awaiter(this, void 0, void 0, function* () {
            const ranking = yield globals_1.dbs.BattleUser.getRanking({ battle_uid });
            return {
                ranking
            };
        });
    }
}
exports.default = new BattleController();
//# sourceMappingURL=battleController.js.map