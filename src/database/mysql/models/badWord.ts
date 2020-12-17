import * as _ from 'lodash';
import Model from '../model';
import { DataTypes, Op,Sequelize } from 'sequelize';


class BadWordModel extends Model {
    private filters: any = [];

    protected initialize(): void {
        this.name = 'badWords';
        this.attributes = {
            activated:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            word:       { type: DataTypes.STRING(50), allowNull: false },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        const records = await this.findAll({activated: true});
        this.filters = _.map(records, (record: any) => record.word);
    }

    isOk (str: string) {
        return _.some(this.filters, (word: string) => str.includes(word));
    }
}


export default (rdb: Sequelize) => new BadWordModel(rdb)
