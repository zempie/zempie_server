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
class RefTagModel extends model_1.default {
    initialize() {
        this.name = 'refTag';
        this.attributes = {
            ref_id: { type: sequelize_1.DataTypes.INTEGER, unique: 'compositeIndex' },
            ref_type: { type: sequelize_1.DataTypes.STRING, unique: 'compositeIndex' },
            tag_id: { type: sequelize_1.DataTypes.INTEGER, unique: 'compositeIndex' },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.Game.model, { foreignKey: 'ref_id', targetKey: 'id' });
        });
    }
}
exports.default = (rdb) => new RefTagModel(rdb);
//# sourceMappingURL=refTag.js.map