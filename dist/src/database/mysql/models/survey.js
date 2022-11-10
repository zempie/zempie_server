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
const model_1 = require("../../_base/model");
class SurveyModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.currentSurvey = () => __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where: {
                    activated: true,
                    start_at: {
                        [sequelize_1.Op.lte]: new Date(),
                    },
                    end_at: {
                        [sequelize_1.Op.gte]: new Date(),
                    },
                },
                order: [['end_at', 'desc']]
            });
            return record === null || record === void 0 ? void 0 : record.get({ plain: true });
        });
    }
    initialize() {
        this.name = 'survey';
        this.attributes = {
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            form_id: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            form_url: { type: sequelize_1.DataTypes.STRING(200), allowNull: false },
            start_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            end_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        };
    }
}
exports.default = (rdb) => new SurveyModel(rdb);
//# sourceMappingURL=survey.js.map