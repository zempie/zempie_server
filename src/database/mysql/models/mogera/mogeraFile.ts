import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';

class MogeraFileModel extends Model {
    protected initialize() {
        this.name = 'mogeraFile';
        this.attributes = {
            user_uid:           { type: DataTypes.STRING(36), allowNull: false, unique: 'compositeIndex' },
            url:                { type: DataTypes.STRING, allowNull: true },
            is_uploaded:        { type: DataTypes.BOOLEAN, defaultValue: false },
            size:               { type: DataTypes.FLOAT, defaultValue: 0 },

        };
    }

    async afterSync(): Promise<void> {

      const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);
  }

}

export default (rdb: Sequelize) => new MogeraFileModel(rdb);
