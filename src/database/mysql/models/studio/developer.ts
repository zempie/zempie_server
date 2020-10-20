import Model from "../../model";
import { DataTypes, Op, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class DeveloperModel extends Model {
    protected initialize() {
        this.name = 'developer';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            user_uid:       { type: DataTypes.STRING(36), allowNull: false, unique: true },
            name:           { type: DataTypes.STRING(50), allowNull: true },
            picture:        { type: DataTypes.STRING(250), allowNull: true },
            mileages:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync()
        this.model.belongsTo(dbs.User.model);
        this.model.hasMany(dbs.Project.model);
    }

    async create({ user_id, user_uid, name, picture, mileages } : any, transaction?: Transaction) {

        const value : any = {
            user_id,
            user_uid,
            name
        };

        if( picture ) {
            value.picture = picture;
        }

        if( mileages ) {
            value.mileages = mileages;
        }

        return super.create(value, transaction);
    }

    // async getDeveloper( { user_id, user_uid, id } : any, transaction?: Transaction ) {
    //
    //     let result = null;
    //
    //     if( user_uid ) {
    //         result = this.model.findOne( {
    //             where: { user_uid },
    //             include : [
    //                 {
    //                     model: dbs.User.model,
    //                 }
    //             ],
    //             transaction
    //         });
    //     }
    //     else if( user_id ) {
    //         result = this.model.findOne( {
    //             where: { user_id },
    //             include : [
    //                 {
    //                     model: dbs.User.model,
    //                 }
    //             ],
    //             transaction
    //         });
    //     }
    //     else if( id ) {
    //         result = this.model.findOne( {
    //             where: { id },
    //             include : [
    //                 {
    //                     model: dbs.User.model,
    //                 }
    //             ],
    //             transaction
    //         });
    //     }
    //
    //
    //     return result;
    // }
    //
    // async findDeveloper( { id } : any, transaction?: Transaction ) {
    //     return this.model.findOne( {
    //         where: { id },
    //         Transaction
    //     } );
    // }

    async updateDeveloper({ user_uid, name, picture, mileages } : any, transaction?: Transaction) {

        const developer = await this.model.findOne( { user_uid }, transaction );

        if( name ) {
            developer.name = name;
        }

        if( picture ) {
            developer.picture = picture;
        }

        if( mileages ) {
            developer.mileages = mileages;
        }

        return await developer.save({ transaction });
    }
}

export default (rdb: Sequelize) => new DeveloperModel(rdb);
