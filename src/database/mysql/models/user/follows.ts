import Model from '../../../_base/model';
import {dbs} from '../../../../commons/globals';
import {DataTypes, Sequelize} from 'sequelize';


class FollowModel extends Model {
    protected initialize() {
        this.name = 'follow';
        this.attributes = {
            user_id: {type: DataTypes.INTEGER},
            follow_id: {type: DataTypes.INTEGER},
        }
        this.options = {
            freezeTableName: true
        }
    }

    async afterSync() {
        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);
        if (!desc['user_id']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'user_id', {
                type: DataTypes.INTEGER,
                after: 'id'
            })
        }
        if (!desc['follow_id']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'follow_id', {
                type: DataTypes.INTEGER,
                after: 'user_id'
            })
        }
    }

    async followingCnt(user_id: number) {
        return await this.model.count({
            where: {
                user_id: user_id
            }
        });
    }

    async followerCnt(user_id: number) {
        return await this.model.count({
            where: {
                follow_id: user_id
            }
        });
    }

    async followStatus(user_uid: string, follow_id: number) {
        const user = await dbs.User.findOne({ uid: user_uid })

        return await this.model.findOne({
            where: {user_id: user.id, follow_id}
        }) ?? false
    }

    // async isFollowing(user_uid: string, followe_id: number)


}

export default (rdb: Sequelize) => new FollowModel(rdb)
