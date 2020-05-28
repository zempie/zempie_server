import * as _ from 'lodash';
import { IUser } from "./_interfaces";
import { dbs } from "../commons/globals";
import { gameCache } from "../database/redis/models/games";

class AlarmController {

    getList = async ({limit = 50, offset = 0}, user: IUser) => {
        const alarms = await dbs.Alarm.getList({ user_uid: user.uid, limit, offset });
        const games = await gameCache.get();

        return {
            alarms: _.map(alarms, (alarm: any) => {
                const extra = JSON.parse(alarm.extra);
                if (extra.game_uid) {
                    extra.game = _.find(games, (g: any) => g.game_uid === extra.game_uid);
                }

                return {
                    id: alarm.id,
                    type: alarm.type,
                    extra,
                    created_at: alarm.created_at,
                    target: alarm.target,
                }
            })
        }
    }
}


export default new AlarmController()