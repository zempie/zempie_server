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
const uniqid = require("uniqid");
const globals_1 = require("../commons/globals");
const enums_1 = require("../commons/enums");
const errorCodes_1 = require("../commons/errorCodes");
const fileManager_1 = require("../services/fileManager");
const opt_1 = require("../../config/opt");
const replaceExt = require('replace-ext');
class ContentController {
    constructor() {
        this.reportGame = ({ target_type, target_id, reason_num, reason }, user, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            if (!target_id || !reason_num) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            let data;
            if (file) {
                const webp = yield fileManager_1.default.convertToWebp(file, 80);
                data = yield fileManager_1.default.s3upload({
                    bucket: opt_1.default.AWS.Bucket.Rsc,
                    key: replaceExt(uniqid(), '.webp'),
                    filePath: webp[0].destinationPath,
                    uid: user.uid,
                    subDir: '/report-game',
                });
            }
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user.uid });
            yield globals_1.dbs.UserReport.create({
                user_id: userRecord.id,
                target_type: enums_1.eReportType.Game,
                target_id,
                reason_num: reason_num.toString(),
                reason,
                url_img: data === null || data === void 0 ? void 0 : data.Location,
            });
        });
        this.reportUser = ({ target_type, target_id, reason_num, reason }, user, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            if (!target_id || !reason_num) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            let data;
            if (file) {
                const webp = yield fileManager_1.default.convertToWebp(file, 80);
                data = yield fileManager_1.default.s3upload({
                    bucket: opt_1.default.AWS.Bucket.Rsc,
                    key: replaceExt(uniqid(), '.webp'),
                    filePath: webp[0].destinationPath,
                    uid: user.uid,
                    subDir: '/report-user',
                });
            }
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user.uid });
            yield globals_1.dbs.UserReport.create({
                user_id: userRecord.id,
                target_type: enums_1.eReportType.User,
                target_id,
                reason_num: reason_num.toString(),
                reason,
                url_img: data === null || data === void 0 ? void 0 : data.Location,
            });
        });
    }
}
exports.default = new ContentController();
//# sourceMappingURL=contentController.js.map