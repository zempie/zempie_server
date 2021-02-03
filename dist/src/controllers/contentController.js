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
const globals_1 = require("../commons/globals");
const enums_1 = require("../commons/enums");
const errorCodes_1 = require("../commons/errorCodes");
class ContentController {
    constructor() {
        this.reportGame = ({ target_type, target_id, reason_num, reason }, user) => __awaiter(this, void 0, void 0, function* () {
            if (!target_id || !reason_num) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user.uid });
            yield globals_1.dbs.UserReport.create({
                user_id: userRecord.id,
                target_type: enums_1.eReportType.Game,
                target_id,
                reason_num,
                reason,
            });
        });
        this.reportUser = ({ target_type, target_id, reason_num, reason }, user) => __awaiter(this, void 0, void 0, function* () {
            if (!target_id || !reason_num) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user.uid });
            yield globals_1.dbs.UserReport.create({
                user_id: userRecord.id,
                target_type: enums_1.eReportType.User,
                target_id,
                reason_num,
                reason,
            });
        });
    }
}
exports.default = new ContentController();
//# sourceMappingURL=contentController.js.map