import Model from '../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';


class RefTagModel extends Model {
    protected initialize(): void {
        this.name = 'refTag';
        this.attributes = {
            ref_id:     { type: DataTypes.INTEGER, unique: 'compositeIndex' },
            ref_type:   { type: DataTypes.STRING, unique: 'compositeIndex' },
            tag_id:     { type: DataTypes.INTEGER, unique: 'compositeIndex' },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.Game.model, { foreignKey: 'ref_id', targetKey: 'id' });
    }
}


export default (rdb: Sequelize) => new RefTagModel(rdb)
