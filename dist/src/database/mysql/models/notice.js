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
const model_1 = require("../../../database/mysql/model");
const sequelize_1 = require("sequelize");
/**
 * 플랫폼 서비스 공지 사항
 */
const samples = [
    { category: 0, title: '공지사항1', content: '내용내용1\ntype = stable', img_link: 'https://t1.daumcdn.net/brunch/service/user/2D9/image/YITANAAcA-ylT5Rd8fsE4mgI7_0.jpg', start_at: '2020-05-19 16:40:47', end_at: '2021-05-21 16:40:55' },
    { category: 1, title: '공지사항2', content: '내용내용2\ntype = once', img_link: 'https://img1.daumcdn.net/thumb/R720x0/?fname=http://t1.daumcdn.net/news/201412/06/seoul/20141206171705476.jpeg', start_at: '2020-05-19 16:40:47', end_at: '2021-05-21 16:40:55' },
    { category: 2, title: '공지사항3', content: '내용내용3\ntype = event', img_link: 'https://img.animalplanet.co.kr/news/2020/02/19/700/1365a2q9p47avck7n98j.jpg', start_at: '2020-05-19 16:40:47', end_at: '2021-05-21 16:40:55' },
];
class NoticeModel extends model_1.default {
    initialize() {
        this.name = 'notice';
        this.attributes = {
            category: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            title: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            content: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
            img_link: { type: sequelize_1.DataTypes.STRING(500) },
            start_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            end_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield this.model.count()) < 1) {
                yield this.bulkCreate(samples);
            }
        });
    }
    getList({ date }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findAll({
                where: {
                    start_at: {
                        [sequelize_1.Op.lte]: date,
                    },
                    end_at: {
                        [sequelize_1.Op.gte]: date,
                    }
                },
                attributes: {
                    exclude: ['id', 'deleted_at', 'updated_at']
                }
            });
        });
    }
}
exports.default = (rdb) => new NoticeModel(rdb);
//# sourceMappingURL=notice.js.map