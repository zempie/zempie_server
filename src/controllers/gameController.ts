import * as _ from 'lodash';
import { IGameParams, IUser } from './_interfaces';
import { Sequelize, Transaction } from 'sequelize';
import { dbs } from "../commons/globals";

const api_key = '5b94uen0k99mxn4t';

class GameController {

    async gameStart({game_uid}: IGameParams, user: IUser) {
        // const user_uid = user.uid;
        // await dbs.GameLog.create({
        //     user_uid: uid,
        //     game_uid
        // });
    }


    async gameOver({game_uid, score}: IGameParams, user: IUser) {
        const user_uid = user.uid;
        await dbs.GameLog.create({
            user_uid,
            game_uid,
            score
        });

        return await dbs.UserGame.getTransaction(async (transaction: Transaction) => {
            const record = await dbs.UserGame.findOne({user_uid, game_uid}, transaction);
            const previous_score = record? record.score : 0;
            const new_record = score > previous_score;

            if( new_record ) {
                record.score = score;
                await record.save({transaction});
            }

            return {
                new_record
            }
        })
    }


    async getList({}, user: IUser, transaction?: Transaction) {
        const response = await fetch(`http://localhost:8288/api/v1/games?key=${api_key}`);
        if( response.status === 200 ) {
            const json = await response.json();
            return json.data
        }
        throw new Error(response.statusText);
    }


    async getRanking({game_uid, limit = 50, skip = 0}: IGameParams, user: IUser, transaction?: Transaction) {
        const { count, rows } = await dbs.UserGame.model.findAndCountAll({
            where: {
                game_uid
            },
            attributes: {
                include: [
                    [Sequelize.literal('(RANK() OVER (ORDER BY score DESC))'), 'rank'],
                ],
            },
            include: [{
                model: dbs.User.model,
                attributes: ['uid', ['display_name', 'displayName'], ['photo_url', 'photoURL']]
            }],
            limit,
            skip,
            transaction
        });

        return {
            list: _.map(rows, (record: any) => {
                return record.get({plain: true});
            })
        }
    }
}


export default new GameController()