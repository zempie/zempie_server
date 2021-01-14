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
const globals_1 = require("../../commons/globals");
const _ = require("lodash");
const user_1 = require("../../database/mysql/models/user/user");
/**
 * 사용자
 */
class AdminUserController {
    getUsers({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            const { count, rows } = yield globals_1.dbs.User.getProfileAll({ limit, offset, sort, dir });
            return {
                count,
                users: _.map(rows, (record) => record.get({ plain: true }))
            };
        });
    }
    getUserProfile({ id, sort = 'id', dir = 'asc' }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.UserProfile.findAndCountAll({ user_id: id }, {
                order: [[sort, dir]],
            });
            return {
                user: user.get({ plain: true })
            };
        });
    }
    banUser({ id, activated, banned, reason, period }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.User.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user = yield globals_1.dbs.User.getInfo({ user_id: id }, transaction);
                if (activated)
                    user.activated = activated;
                if (banned && reason && period && Object.values(user_1.EBan).includes(banned)) {
                    user.banned = banned;
                    yield globals_1.dbs.UserBan.create({
                        user_id: id,
                        admin_id: admin.id,
                        reason,
                        period,
                    }, transaction);
                }
                yield user.save({ transaction });
            }));
        });
    }
    getBadWords({ limit = 50, offset = 0 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield globals_1.dbs.BadWord.findAll({}, {
                limit,
                offset,
            });
            return {
                bad_words: _.map(records, (r) => {
                    return {
                        activated: r.activated,
                        word: r.word,
                    };
                })
            };
        });
    }
    addBadWord({ word }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.BadWord.create({ word });
        });
    }
    delBadWord({ id }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.BadWord.destroy({ id });
        });
    }
    setBadWord({ id, activated }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.BadWord.update({ id }, { activated });
        });
    }
}
exports.default = new AdminUserController();
//# sourceMappingURL=adminUserController.js.map