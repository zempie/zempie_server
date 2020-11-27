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
const globals_1 = require("../commons/globals");
const sequelize_1 = require("sequelize");
const errorCodes_1 = require("../commons/errorCodes");
const notifyService_1 = require("../services/notifyService");
const enums_1 = require("../commons/enums");
class SocialMediaController {
    constructor() {
        this.follow = ({ target_uid }, user) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.Follow.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user_uid = user.uid;
                const { user_id, target_id } = yield this.getIds({ user_uid, target_uid }, transaction);
                yield globals_1.dbs.Follow.follow({ user_id, target_id }, transaction);
                yield globals_1.dbs.UserProfile.update({ following_cnt: sequelize_1.Sequelize.literal('following_cnt + 1') }, { user_id }, transaction);
                yield globals_1.dbs.UserProfile.update({ followers_cnt: sequelize_1.Sequelize.literal('followers_cnt + 1') }, { user_id: target_id }, transaction);
                yield globals_1.dbs.Alarm.create({ user_uid: target_uid, target_uid: user_uid, type: enums_1.eAlarm.Follow, extra: { target_uid } }, transaction);
                yield notifyService_1.default.notify({ user_uid: target_uid, type: enums_1.eNotify.Follow, data: { target_uid } });
            }));
        });
        this.unFollow = ({ target_uid }, user) => {
            return globals_1.dbs.Follow.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const user_uid = user.uid;
                const { user_id, target_id } = yield this.getIds({ user_uid, target_uid }, transaction);
                yield globals_1.dbs.Follow.unFollow({ user_id, target_id }, transaction);
                yield globals_1.dbs.UserProfile.update({ following_cnt: sequelize_1.Sequelize.literal('following_cnt - 1') }, { user_id }, transaction);
                yield globals_1.dbs.UserProfile.update({ followers_cnt: sequelize_1.Sequelize.literal('followers_cnt - 1') }, { user_id: target_id }, transaction);
            }));
        };
        this.getIds = ({ user_uid, target_uid }, transaction) => __awaiter(this, void 0, void 0, function* () {
            if (user_uid === target_uid) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_USER_UID);
            }
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user_uid });
            const targetRecord = yield globals_1.dbs.User.findOne({ uid: target_uid });
            if (!targetRecord) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_USER_UID);
            }
            return {
                user_id: userRecord.id,
                target_id: targetRecord.id
            };
        });
    }
    following({ user_uid }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            user_uid = user_uid || user.uid;
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user_uid });
            const user_id = userRecord.id;
            const records = yield globals_1.dbs.Follow.following({ user_id });
            return {
                following: records.map((record) => {
                    return {
                        uid: record.target.uid,
                        name: record.target.name,
                        picture: record.target.picture
                    };
                })
            };
        });
    }
    followers({ user_uid }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            user_uid = user_uid || user.uid;
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user_uid });
            const user_id = userRecord.id;
            const records = yield globals_1.dbs.Follow.followers({ user_id });
            return {
                followers: records.map((record) => {
                    return {
                        uid: record.user.uid,
                        name: record.user.name,
                        picture: record.user.picture
                    };
                })
            };
        });
    }
}
exports.default = new SocialMediaController();
//# sourceMappingURL=socialMediaControlller.js.map