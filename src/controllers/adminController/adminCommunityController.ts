import {dbs} from "../../commons/globals";
import * as _ from "lodash";

class AdminCommunityController {
    manageReport = async (params: any) => {

    }

    userReportList = async ({limit = 20, offset = 0, sort = 'created_at', dir = 'asc'}: any) => {

        const {count, rows} = await dbs.UserReport.getUserReportList({limit, offset, sort, dir});

        return {
            count,
            lists: _.map(rows, (row: any) => {
                return {
                    id: row.id,
                    user: row.reporterUser,
                    target_user: row.targetUser,
                    reason_num: row.reason_num,
                    reason: row.reason,
                    is_done: row.is_done,
                    url_img: row.url_img,
                    created_at: row.created_at

                }
            })
        }

    }
}

export default new AdminCommunityController();