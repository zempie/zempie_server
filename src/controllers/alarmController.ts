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
            alarms
        }
    }
}


export default new AlarmController()