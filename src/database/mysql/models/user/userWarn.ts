import Model from '../../../_base/model';
import {DataTypes, Op, Sequelize} from 'sequelize';
import { dbs } from '../../../../commons/globals';
import * as _ from "lodash";


class UserWarnModel extends Model {
    protected initialize(): void {
        this.name = 'userWarn';
        this.attributes = {
            user_id:      { type: DataTypes.INTEGER, allowNull: false },
            admin_id:     { type: DataTypes.INTEGER, allowNull: false },
            reason_num:   { type: DataTypes.INTEGER, allowNull: false },
            reason:       { type: DataTypes.STRING(300) },
            is_done:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
            process_msg:  { type: DataTypes.STRING(300) }
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model);
        this.model.belongsTo(dbs.Admin.model);
    }

    userWarningList = async ({user_id, limit = 20, offset = 0, sort = 'created_at', dir = 'desc'}: any) => {
      return await this.model.findAndCountAll({
        limit: _.toNumber(limit),
        offset: _.toNumber(offset),
        order: [[sort, dir]],
        where:{
          user_id
        },
    })

  }


}


export default (rdb: Sequelize) => new UserWarnModel(rdb)
