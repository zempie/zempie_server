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
const cron_1 = require("cron");
const globals_1 = require("../commons/globals");
const sequelize_1 = require("sequelize");
const enums_1 = require("../commons/enums");
const utils_1 = require("../commons/utils");
const logger_1 = require("../commons/logger");
class ExchangeManager {
    constructor() {
        this.job = new cron_1.CronJob('0 10 * * * *', () => __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(`exchange manager`.yellow);
            // await this.exchangePoints()
        }), null, false, 'Asia/Seoul');
    }
    start() {
        if (this.job) {
            this.job.start();
        }
        this.exchangePoints();
    }
    stop() {
        if (this.job) {
            this.job.stop();
        }
    }
    exchangePoints() {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.GeneratedPointsLog.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const today = utils_1.Today();
                const logs = yield globals_1.dbs.GeneratedPointsLog.findAll({
                    exchanged: false,
                    created_at: {
                        [sequelize_1.Op.lt]: today
                    }
                }, transaction);
                for (let i = 0; i < logs.length; i++) {
                    const log = logs[i];
                    switch (log.pub_type) {
                        case enums_1.ePubType.GamePlay:
                            break;
                        default:
                            continue;
                    }
                    log.exchanged = true;
                    yield log.save({ transaction });
                }
            }));
        });
    }
}
exports.default = new ExchangeManager();
//# sourceMappingURL=exchangeManager.js.map