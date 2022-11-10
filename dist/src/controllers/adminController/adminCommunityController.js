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
const globals_1 = require("../../commons/globals");
const _ = require("lodash");
class AdminCommunityController {
    constructor() {
        this.manageReport = (params) => __awaiter(this, void 0, void 0, function* () {
        });
        this.userReportList = ({ limit = 20, offset = 0, sort = 'created_at', dir = 'asc' }) => __awaiter(this, void 0, void 0, function* () {
            const { count, rows } = yield globals_1.dbs.UserReport.getUserReportList({ limit, offset, sort, dir });
            return {
                count,
                lists: _.map(rows, (row) => {
                    return {
                        id: row.id,
                        user: row.reporterUser,
                        target_user: row.targetUser,
                        reason_num: row.reason_num,
                        reason: row.reason,
                        is_done: row.is_done,
                        url_img: row.url_img,
                        created_at: row.created_at
                    };
                })
            };
        });
    }
}
exports.default = new AdminCommunityController();
//# sourceMappingURL=adminCommunityController.js.map