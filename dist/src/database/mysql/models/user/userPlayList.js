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
const sequelize_1 = require("sequelize");
const model_1 = require("../../model");
const globals_1 = require("../../../../commons/globals");
class UserPlayListModel extends model_1.default {
    initialize() {
        this.name = 'userPlayList';
        this.attributes = {
            uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            title: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            url_bg: { type: sequelize_1.DataTypes.STRING(250) },
            count_visited: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.User.model);
            this.model.hasMany(globals_1.dbs.UserPlayListGame.model, { as: 'games' });
        });
    }
    getPlayList({ uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where: { uid },
                include: [{
                        model: globals_1.dbs.User.model,
                    }, {
                        model: globals_1.dbs.UserPlayListGame.model,
                        as: 'games',
                        include: [{
                                model: globals_1.dbs.Game.model,
                                include: [{
                                        model: globals_1.dbs.User.model,
                                    }]
                            }]
                    }]
            });
            return record.get({ plain: true });
        });
    }
}
exports.default = (rdb) => new UserPlayListModel(rdb);
//# sourceMappingURL=userPlayList.js.map