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
const globals_1 = require("../../commons/globals");
class GameContentController {
    constructor() {
        this.createOrUpdateChallengingReport = ({ game_id, rating, comment }, user) => __awaiter(this, void 0, void 0, function* () {
            return yield globals_1.dbs.GameChallengingReport.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                let report = yield globals_1.dbs.GameChallengingReport.findOne({ user_uid: user.uid, game_id }, transaction);
                if (report) {
                    report.rating = rating;
                    report.comment = comment;
                    yield report.save({ transaction });
                }
                else {
                    report = yield globals_1.dbs.GameChallengingReport.create({ user_uid: user.uid, game_id, rating, comment }, transaction);
                }
            }));
        });
        this.getReports = ({ game_id, limit = 50, offset = 0 }, user) => __awaiter(this, void 0, void 0, function* () {
            const reports = yield globals_1.dbs.GameChallengingReport.findAll({ game_id }, {
                include: [{
                        model: globals_1.dbs.User.model,
                    }],
                order: [['id', 'asc']],
                limit,
                offset,
            });
            return {
                reports: _.map(reports, (report) => {
                    return {
                        rating: report.rating,
                        comment: report.comment,
                        user: {
                            uid: report.user.uid,
                            name: report.user.name,
                            picture: report.user.picture,
                        }
                    };
                })
            };
        });
    }
}
exports.default = new GameContentController();
//# sourceMappingURL=gameContentController.js.map