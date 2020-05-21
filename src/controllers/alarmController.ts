import * as _ from 'lodash';
import { IUser } from "./_interfaces";
import { dbs } from "../commons/globals";

class AlarmController {

    getList = async ({}, user: IUser) => {
        const alarms = await dbs.Alarm.findAll(
            {
                user_uid: user.uid
            },
            {
                attributes: ['id', 'type', 'extra', 'created_at'],
            });

        return {
            alarms: _.map(alarms, (alarm: any) => {
                return {
                    id: alarm.id,
                    type: alarm.type,
                    extra: JSON.parse(alarm.extra),
                    created_at: alarm.created_at,
                }
            })
        }
    }
}


export default new AlarmController()