import Model from '../../../_base/model';
import {DataTypes, Sequelize} from 'sequelize';
import {eReportType} from '../../../../commons/enums';
import {dbs} from '../../../../commons/globals';
import * as _ from "lodash";


/**
 * 신고 하기
 * user_id: 신고한 유저
 * target_id: 신고 당한 유저/게임/댓글/...
 */

class UserReportModel extends Model {
    protected initialize(): void {
        this.name = 'userReport';
        this.attributes = {
            user_id: {type: DataTypes.INTEGER, allowNull: false},
            target_type: {type: DataTypes.SMALLINT, allowNull: false, defaultValue: eReportType.Game},
            target_id: {type: DataTypes.INTEGER, allowNull: false},
            reason_num: {type: DataTypes.STRING(30), allowNull: false},
            reason: {type: DataTypes.STRING(300)},
            is_done: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
            url_img: {type: DataTypes.STRING(255)},
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model, {as: 'targetUser', foreignKey: 'target_id', targetKey: 'id'});
        this.model.belongsTo(dbs.User.model, {as: 'reporterUser', foreignKey: 'user_id', targetKey: 'id'});
        this.model.belongsTo(dbs.Game.model, {foreignKey: 'target_id', targetKey: 'id'});
    }

    async getUserReportList({limit = 20, offset = 0, sort = 'created_at', dir = 'asc'}: any) {
        return await this.model.findAll({
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
            order: [[sort, dir]],
            include: [{
                model: dbs.User.model,
                as: 'targetUser',
                attributes: ['id', 'uid', 'name', 'email', 'channel_id'],
            },
            {
                model: dbs.User.model,
                as: 'reporterUser',
                attributes: ['id', 'uid', 'name', 'email', 'channel_id'],
            }
            ]
        })
    }


}


export default (rdb: Sequelize) => new UserReportModel(rdb)
