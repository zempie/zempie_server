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
const errorCodes_1 = require("../commons/errorCodes");
const globals_1 = require("../commons/globals");
const fileManager_1 = require("../services/fileManager");
const opt_1 = require("../../config/opt");
const replaceExt = require('replace-ext');
class SupportController {
    askInquiry({ category, title, text }, { uid }, { req: { files: { file } } }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!title || title.length < 1) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_QNA_PARAMS);
            }
            if (!text || text.length < 5) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_QNA_PARAMS);
            }
            let url_img = null;
            if (file) {
                const webp = yield fileManager_1.default.convertToWebp(file, 80);
                const data = yield fileManager_1.default.s3upload({
                    bucket: opt_1.default.AWS.Bucket.Rsc,
                    key: replaceExt(Date.now().toString(), '.webp'),
                    filePath: webp[0].destinationPath,
                    uid,
                    subDir: '/support/inquiries',
                });
                url_img = data.Location;
            }
            const user = yield globals_1.dbs.User.findOne({ uid });
            yield globals_1.dbs.UserInquiry.create({ user_id: user.id, category, title, text, url_img });
        });
    }
    getMyInquiries({ limit = 50, offset = 0 }, { uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.findOne({ uid });
            return yield globals_1.dbs.UserInquiry.getList({ user_id: user.id, limit, offset });
        });
    }
    getMyInquiry({ id }, { uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.findOne({ uid });
            const inquiry = yield globals_1.dbs.UserInquiry.model.findOne({
                where: { user_id: user.id, id },
                include: [{
                        model: globals_1.dbs.Admin.model,
                    }]
            });
            return {
                inquiry: {
                    id: inquiry.id,
                    category: inquiry.category,
                    title: inquiry.title,
                    text: inquiry.text,
                    url_img: inquiry.url_img,
                    response: inquiry.response,
                    created_at: inquiry.created_at,
                    updated_at: inquiry.updated_at,
                    admin: {
                        name: inquiry.admin ? inquiry.admin.name : undefined,
                    }
                }
            };
        });
    }
    getNotices({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { count, rows } = yield globals_1.dbs.Notice.findAndCountAll({ activated: true }, {
                order: [[sort, dir]],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
            return {
                count,
                notices: _.map(rows, (row) => {
                    return {
                        id: row.id,
                        category: row.category,
                        title: row.title,
                        // content: row.content,
                        created_at: row.created_at,
                    };
                })
            };
        });
    }
    getNotice({ id }) {
        return __awaiter(this, void 0, void 0, function* () {
            const notice = yield globals_1.dbs.Notice.model.findOne({
                where: { id },
                attributes: {
                    exclude: ['updated_at', 'deleted_at']
                }
            });
            return {
                notice: notice.get({ plain: true })
            };
        });
    }
}
exports.default = new SupportController();
//# sourceMappingURL=supportController.js.map