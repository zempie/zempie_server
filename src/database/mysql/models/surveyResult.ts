import { DataTypes, Sequelize } from 'sequelize';
import Model from '../model';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { dbs } from '../../../commons/globals';


class SurveyResultModel extends Model {
    protected initialize(): void {
        this.name = 'surveyResult';
        this.attributes = {
            user_uid:   { type: DataTypes.STRING(36), allowNull: false },
            survey_id:  { type: DataTypes.INTEGER, allowNull: false },
        }
    }


    async afterSync(): Promise<void> {
        await super.afterSync();
        this.model.belongsTo(dbs.Survey.model);
    }


    isDone = async (user_uid: string) => {
        const currentSurvey = await dbs.Survey.currentSurvey();
        if ( currentSurvey ) {
            return await this.findOne({
                user_uid,
                survey_id: currentSurvey.id
            });
        }
    }
}


export default (rdb: Sequelize) => new SurveyResultModel(rdb)
