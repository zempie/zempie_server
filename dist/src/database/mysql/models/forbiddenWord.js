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
const _ = require("lodash");
const model_1 = require("../model");
const sequelize_1 = require("sequelize");
class ForbiddenWord extends model_1.default {
    constructor() {
        super(...arguments);
        this.filters = [];
    }
    initialize() {
        this.name = 'forbiddenWords';
        this.attributes = {
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            word: { type: sequelize_1.DataTypes.STRING(50), allowNull: false }
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            const records = yield this.findAll({ activated: true });
            this.filters = _.map(records, (record) => record.word);
        });
    }
    isOk(str) {
        return !_.some(this.filters, (word) => str.toLowerCase().includes(word));
    }
    areOk(obj) {
        return !_.some(this.filters, (word) => {
            return _.some(obj, (str) => {
                return typeof str === 'string' && str.toLocaleLowerCase().includes(word);
            });
        });
    }
}
exports.default = (rdb) => new ForbiddenWord(rdb);
//# sourceMappingURL=forbiddenWord.js.map