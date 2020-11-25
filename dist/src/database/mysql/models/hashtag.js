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
const model_1 = require("../model");
const sequelize_1 = require("sequelize");
class HashtagModel extends model_1.default {
    initialize() {
        this.name = 'hashtag';
        this.attributes = {
            fixed: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            name: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            if ((yield this.model.count()) < 1) {
                const bulk = [
                    { fixed: true, name: 'arcade' }, { fixed: true, name: '아케이드' },
                    { fixed: true, name: 'puzzle' }, { fixed: true, name: '퍼즐' },
                    { fixed: true, name: 'sports' }, { fixed: true, name: '스포츠' },
                ];
                yield this.model.bulkCreate(bulk);
            }
        });
    }
}
exports.default = (rdb) => new HashtagModel(rdb);
//# sourceMappingURL=hashtag.js.map