"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
class ScheduleService {
    constructor() {
        this.start = () => {
            if (this.job) {
                this.job.start();
            }
        };
        this.job = new cron_1.CronJob('0 * * * *', () => {
            console.log(`cron 스케쥴러 on ${new Date().getSeconds()}`.yellow);
        }, null, false, 'Asia/Seoul');
    }
}
exports.default = new ScheduleService();
//# sourceMappingURL=scheduleService.js.map