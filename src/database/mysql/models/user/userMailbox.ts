import * as _ from 'lodash';
import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';


class UserMailboxModel extends Model {
    protected initialize(): void {
        this.name = 'userMailbox';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            is_read:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            title:          { type: DataTypes.STRING(100), allowNull: false },
            content:        { type: DataTypes.STRING(500), allowNull: false },
            hide:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        }
    }

    getMails = async ({ user_uid, hide = false, limit = 50, offset = 0 }: any) => {
        return await this.model.findAll({
            where: { user_uid, hide },
            attributes: {
                exclude: ['created_at', 'updated_at', 'deleted_at'],
            },
            order: [['created_at', 'desc']],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        })
    }
}


export default (rdb: Sequelize) => new UserMailboxModel(rdb)
