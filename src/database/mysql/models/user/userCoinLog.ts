import Model from '../../../_base/model';
import { DataTypes, QueryTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


/**
 * 충전 재화(zem, pie) 로그
 * type: 1 -> 결제, 2 -> 선물, 3 -> 이벤트
 * info: 해당 type에 따른 정보 
 */

class UserCoinLogModel extends Model {
    protected initialize() {
        this.name = 'userCoinLog';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            zem:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            pie:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            type:           { type: DataTypes.TINYINT, defaultValue: 1 },  
            info:           { type: DataTypes.JSON },
        };
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }



    async getProfitByDate({ limit = 10, offset = 0, sort = 'created_at', dir = 'desc', start_date , end_date } : any){

        const startDateStr = start_date.toISOString().slice(0, 19).replace('T', ' ');
        const endDateStr = end_date.toISOString().slice(0, 19).replace('T', ' ');

        const query = `
        SELECT 
            sort,
            GROUP_CONCAT(CONCAT(type, ': ', totalZem) ORDER BY type ASC SEPARATOR ', ') AS total_by_type
        FROM (
            SELECT 
                ${sort === 'created_at' ? 'DATE(created_at)' : sort} AS sort,
                type,
                SUM(zem) AS totalZem
            FROM user_coin_logs
            WHERE ${sort} BETWEEN '${startDateStr}' AND '${endDateStr}'
            GROUP BY sort, type
        ) AS subquery
        GROUP BY sort
        ORDER BY sort ${dir}
        LIMIT ${limit}
        OFFSET ${offset}
        ;`

        const result = await this.db.query(query,  {
            replacements: {
                startDate: Date.parse(start_date),
                endDate: Date.parse(end_date),
            },
            type: QueryTypes.SELECT,
        })
        return result
    }
    

}

export default (rdb: Sequelize) => new UserCoinLogModel(rdb);
