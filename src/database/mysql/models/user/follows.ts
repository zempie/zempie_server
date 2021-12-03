import Model from "../../../_base/model";
import {DataTypes, Sequelize} from "sequelize";

class FollowModel extends Model {
    protected initialize() {

        this.name = 'follow';
        this.attributes = {
            user_id: {type: DataTypes.INTEGER, allowNull: false},
            follow_id: {type: DataTypes.INTEGER, allowNull: false},
        }
        this.options={
            freezeTableName:true
        }
    }
        async afterSync() {
            const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);

            if ( !desc['user_id'] ) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'user_id', {
                    type: DataTypes.INTEGER,
                    after: 'id'
                })
            }
            if ( !desc['follow_id'] ) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'follow_id', {
                    type: DataTypes.INTEGER,
                    after: 'user_id'
                })
            }
        }

        async followCnt(user_id: number){

        const result = await this.model.count({
                where: {
                    user_id: user_id
                },
                attributes: {
                    exclude: ['updated_at', 'deleted_at']
                }

            });

        return result;

        }





}

export default (rdb: Sequelize) => new FollowModel(rdb);