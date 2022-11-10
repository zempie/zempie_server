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
exports.EBan = void 0;
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
const enums_1 = require("../../../../commons/enums");
const _ = require("lodash");
/**
 * firebase authentication 에서 얻어온 사용자 정보
 */
var EBan;
(function (EBan) {
    EBan[EBan["not"] = 0] = "not";
    EBan[EBan["suspension"] = 1] = "suspension";
    EBan[EBan["permanent"] = 2] = "permanent";
})(EBan = exports.EBan || (exports.EBan = {}));
class UserModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.getProfile = (where, transaction) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this.model.findOne({
                where,
                include: [{
                        model: globals_1.dbs.UserProfile.model,
                        as: 'profile',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        }
                    },
                    {
                        model: globals_1.dbs.UserGame.model,
                        as: 'gameRecords',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        },
                        include: [{
                                model: globals_1.dbs.Game.model,
                            }]
                    },
                    {
                        model: globals_1.dbs.Game.model,
                        as: 'devGames',
                    },
                    {
                        model: globals_1.dbs.Project.model,
                        as: 'projects'
                    }],
                transaction
            });
            if (user) {
                return user.get({ plain: true });
            }
        });
        this.getProfileByUid = ({ uid }) => __awaiter(this, void 0, void 0, function* () {
            return this.getProfile({ uid });
        });
        this.getProfileByChannelId = ({ channel_id }) => __awaiter(this, void 0, void 0, function* () {
            return this.getProfile({ channel_id });
        });
        this.getProfileByUserID = ({ user_id }) => __awaiter(this, void 0, void 0, function* () {
            return this.getProfile({ id: user_id });
        });
        this.search = ({ search_name, limit = 100, offset = 0 }, transaction) => __awaiter(this, void 0, void 0, function* () {
            return this.model.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.substring]: `%${search_name}%`,
                    }
                },
                include: [{
                        model: globals_1.dbs.UserProfile.model,
                        as: 'profile',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        }
                    }],
                limit,
                offset,
                transaction
            });
        });
        this.getClaims = ({ user_id }) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.model.findOne({
                where: { id: user_id },
                include: [{
                        model: globals_1.dbs.UserClaim.model,
                        as: 'claims',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        }
                    }],
            });
            return claims.get({ plain: true });
        });
        this.hasNickname = (nickname) => __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({
                where: { nickname: nickname }
            });
        });
        this.hasEmail = (email) => __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({
                where: { email: email }
            });
        });
    }
    initialize() {
        this.name = 'user';
        this.attributes = {
            uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false, unique: true },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            banned: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: EBan.not },
            name: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
            nickname: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
            channel_id: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            picture: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
            url_banner: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
            provider: { type: sequelize_1.DataTypes.STRING(20), allowNull: true, defaultValue: 'password' },
            email: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
            email_verified: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            fcm_token: { type: sequelize_1.DataTypes.STRING },
            is_developer: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            last_log_in: { type: sequelize_1.DataTypes.DATE },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.hasOne(globals_1.dbs.UserProfile.model, { sourceKey: 'id', foreignKey: 'user_id', as: 'profile' });
            this.model.hasOne(globals_1.dbs.UserSetting.model, { sourceKey: 'id', foreignKey: 'user_id', as: 'setting' });
            this.model.hasMany(globals_1.dbs.UserGame.model, { sourceKey: 'uid', foreignKey: 'user_uid', as: 'gameRecords' });
            this.model.hasMany(globals_1.dbs.UserPublishing.model, { sourceKey: 'uid', foreignKey: 'user_uid', as: 'publishing' });
            this.model.hasMany(globals_1.dbs.UserExternalLink.model, { as: 'externalLink' });
            this.model.hasMany(globals_1.dbs.Game.model, { as: 'devGames' });
            this.model.hasMany(globals_1.dbs.Project.model, { as: 'projects' });
            this.model.hasMany(globals_1.dbs.UserClaim.model, { as: 'claims' });
            const desc = yield this.model.sequelize.queryInterface.describeTable(this.model.tableName);
            if (!desc['nickname']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'nickname', {
                    type: sequelize_1.DataTypes.STRING,
                    after: 'name'
                });
            }
            if (!desc['url_banner']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'url_banner', {
                    type: sequelize_1.DataTypes.STRING,
                    after: 'picture'
                });
            }
        });
    }
    getInfo({ uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOne({
                where: { uid },
                include: [
                    {
                        model: globals_1.dbs.UserProfile.model,
                        as: 'profile',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        }
                    },
                    {
                        model: globals_1.dbs.UserSetting.model,
                        as: 'setting',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        }
                    },
                    // {
                    //     model: dbs.UserGame.model,
                    //     as: 'gameRecords',
                    //     attributes: {
                    //         exclude: ['created_at', 'updated_at', 'deleted_at'],
                    //     },
                    //     include: [{
                    //         model: dbs.Game.model,
                    //     }]
                    // },
                    // {
                    //     model: dbs.Game.model,
                    //     as: 'devGames',
                    // }
                ],
                transaction
            });
        });
    }
    getSetting({ uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.model.findOne({
                where: { uid },
                include: [{
                        model: globals_1.dbs.UserSetting.model,
                        as: 'setting',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        }
                    }],
                transaction
            });
            if (user) {
                const _user = user.get({ plain: true });
                _user.notify = {};
                _user.notify[enums_1.eNotify.Alarm] = _user.setting.notify_alarm;
                _user.notify[enums_1.eNotify.Battle] = _user.setting.notify_battle;
                _user.notify[enums_1.eNotify.Beat] = _user.setting.notify_beat;
                // _user.notify[eNotify.Follow] = _user.setting.notify_follow;
                _user.notify[enums_1.eNotify.Like] = _user.setting.notify_like;
                _user.notify[enums_1.eNotify.Reply] = _user.setting.notify_reply;
                return _user;
            }
        });
    }
    getPublishing({ uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOne({
                where: { uid },
                include: [{
                        model: globals_1.dbs.UserPublishing.model,
                        as: 'publishing',
                        include: [{
                                model: globals_1.dbs.Game.model,
                            }]
                    }],
                transaction
            });
        });
    }
    getProfileAll({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findAndCountAll({
                where: {},
                attributes: {
                    exclude: ['deleted_at'],
                },
                include: [{
                        as: 'profile',
                        model: globals_1.dbs.UserProfile.model,
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at', 'deleted_at'],
                        }
                    }],
                order: [[sort, dir]],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
                transaction
            });
            // return records.map((record: any) => record.get({plain: true}))
        });
    }
}
exports.default = (rdb) => new UserModel(rdb);
//# sourceMappingURL=user.js.map