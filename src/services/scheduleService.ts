import { CronJob } from 'cron';


class ScheduleService {
    private job: CronJob | undefined;

    constructor() {
        this.job = new CronJob('* 38 10 * * *', () => {
            console.log(`cron 스케쥴러 on ${new Date().getSeconds()}`.yellow);
        }, null, true, 'Asia/Seoul');
    }

    start = () => {

    }
}

export default new ScheduleService()