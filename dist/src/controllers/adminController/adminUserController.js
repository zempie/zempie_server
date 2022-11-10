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
const notifyService_1 = require("../../services/notifyService");
const errorCodes_1 = require("../../commons/errorCodes");
/**
 * 사용자
 */
class AdminUserController {
    notify({ title, body }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            const topic = 'test-topic';
            const data = {
                title,
                body,
            };
            yield notifyService_1.default.send({ topic, data });
        });
    }
    /**
     * mail
     */
    sendMail({ user_uid, category, title, content }, _admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.UserMailbox.create({
                user_uid,
                category,
                title,
                content,
            });
        });
    }
    cancelMail({ mail_id }) {
        return __awaiter(this, void 0, void 0, function* () {
            const mail = yield globals_1.dbs.UserMailbox.findOne({ id: mail_id });
            if (mail.is_read) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.ALREADY_ADMIN_USER_READ_MAIL);
            }
            yield mail.destroy({});
        });
    }
    /**
     * user
     */
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
    banUser({ report_id, user_id, reason, period }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserBan = yield globals_1.dbs.UserBan.getUserBan({ user_id });
            if (isUserBan) {
                yield globals_1.dbs.UserReport.update({ is_done: true }, { id: report_id });
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.ALREADY_BANNED_USER);
            }
            yield globals_1.dbs.UserBan.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                yield globals_1.dbs.UserReport.update({ is_done: true }, { id: report_id });
                yield globals_1.dbs.UserBan.create({
                    user_id,
                    admin_id: admin.id,
                    reason,
                    period,
                }, transaction);
            }));
        });
    }
    cancelBanUser({ report_id, user_id }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.UserBan.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                yield globals_1.dbs.UserReport.update({ is_done: true }, { id: report_id });
                yield globals_1.dbs.UserBan.update({
                    period: new Date(),
                }, { user_id: user_id });
            }));
        });
    }
    getBadWords({ limit = 50, offset = 0 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield globals_1.dbs.BadWords.findAll({}, {
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
            yield globals_1.dbs.BadWords.create({ word });
        });
    }
    delBadWord({ id }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.BadWords.destroy({ id });
        });
    }
    setBadWord({ id, activated }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.BadWords.update({ activated }, { id });
        });
    }
    getForbiddenWord({ limit = 50, offset = 0 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield globals_1.dbs.ForbiddenWords.findAll({}, {
                limit,
                offset,
            });
            return {
                forbidden_words: _.map(records, (r) => {
                    return {
                        activated: r.activated,
                        word: r.word,
                    };
                })
            };
        });
    }
    addForbiddenWord({ word }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.ForbiddenWords.create({ word });
        });
    }
    delForbiddenWord({ id }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.ForbiddenWords.destroy({ id });
        });
    }
    setForbiddenWord({ id, activated }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.ForbiddenWords.update({ activated }, { id });
        });
    }
}
exports.default = new AdminUserController();
//# sourceMappingURL=adminUserController.js.map