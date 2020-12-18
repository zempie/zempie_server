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
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
const errorCodes_1 = require("../../../../commons/errorCodes");
class GameChallengingReportModel extends model_1.default {
    initialize() {
        this.name = 'gameChallengingReport';
        this.attributes = {
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false, unique: 'compositeIndex' },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            rating: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
            comment: { type: sequelize_1.DataTypes.STRING(250) },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
            this.model.belongsTo(globals_1.dbs.Game.model);
        });
    }
    create({ user_uid, game_id, rating, comment }, transaction) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (rating < 1 || rating > 5) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            return _super.create.call(this, { user_uid, game_id, rating, comment }, transaction);
        });
    }
}
exports.default = (rdb) => new GameChallengingReportModel(rdb);
//# sourceMappingURL=gameChallengingReport.js.map