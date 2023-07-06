import Model from '../../../_base/model';
import { dbs } from '../../../../commons/globals';
import { DataTypes, Sequelize } from 'sequelize';


class BlockModel extends Model {
    protected initialize(): void {
        this.name = 'block';
        this.attributes = {
            id:               { type: DataTypes.STRING(36), allowNull: false, primaryKey: true },
            community_id:     { type: DataTypes.STRING(255) },
            user_id:          { type: DataTypes.INTEGER },
            target_id:        { type: DataTypes.INTEGER },
            blocked_at:       { type: DataTypes.BIGINT },
            expires_on:       { type: DataTypes.BIGINT },
            reason:           { type: DataTypes.STRING(255) },
            type:             { type: DataTypes.ENUM('USERBLOCK','COMMUNITYBLOCK','MUTE','KICK') }
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();
        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });
    }

   
}




export default (rdb: Sequelize) => new BlockModel(rdb)
