import { v4 as uuid } from 'uuid';
import Model from '../../../database/mysql/model';
import { Sequelize, DataTypes } from 'sequelize';
import { makePassword } from '../../../commons/utils';

class AdminModel extends Model {
    protected initialize() {
        this.name = 'admin';
        this.attributes = {
            uid:            { type: DataTypes.UUID, allowNull: false },
            name:           { type: DataTypes.STRING(50), allowNull: false },
            password:       { type: DataTypes.STRING(1000), allowNull: false },
            level:          { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
            activated:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        };
    }

    async afterSync(): Promise<void> {
        if ( await this.model.count() < 1 ) {
            const password = makePassword('administrator');
            await this.model.create({
                uid: uuid(),
                name: 'admin',
                password,
                level: 10,
            });
        }
    }

}

export default (rdb: Sequelize) => new AdminModel(rdb);