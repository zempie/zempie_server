import {dbs} from "../../commons/globals";
import * as _ from "lodash";

class AdminCommunityController {
    manageReport = async (params: any) => {

    }

    userReportList = async ({limit = 20, offset = 0, sort = 'created_at', dir = 'asc'}: any) => {

        const records = await dbs.UserReport.getUserReportList({limit , offset, sort, dir });

        return _.map(records, (record: any) => {
            return{
                id:record.id,
                user: record.reporterUser,
                target_user: record.targetUser,
                reason_num: record.reason_num,
                reason: record.reason,
                is_done: record.is_done,
                url_img: record.url_img,
                created_at: record.created_at

            }
        })
    }
}

export default new AdminCommunityController();