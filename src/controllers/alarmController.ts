import { IUser } from "./_interfaces";
import { dbs } from "../commons/globals";

class AlarmController {

    getList = async ({}, user: IUser) => {
        const notices = await dbs.Alarm.findAll(
            {
                user_uid: user.uid
            },
            {
                attributes: ['id', 'type', 'extra', 'created_at'],
            });

        return {
            notices
        }
    }
}


export default new AlarmController()