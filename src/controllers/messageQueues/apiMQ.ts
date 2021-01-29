import * as _ from 'lodash';
import { SrvMQ } from './_srvMQ';
import { dbs } from '../../commons/globals';
import { Sequelize, Transaction } from 'sequelize';


class ApiMQ extends SrvMQ {
    private interval: NodeJS.Timeout;
    private game_emotion: {[Key: number]: {
            [Key: string]: boolean,
        }} = {};
    private game_ids: {[Key: number]: {
            count_over: number,
            count_heart: number,
        }} = {};

    constructor() {
        super();

        this.interval = setInterval(async () => {
            await this.processBulk();
        }, 1000 * 10);
    }

    private processBulk = async () =>{
        _.forEach(this.game_ids, async (obj: any, id: any) => {
            if ( obj.count_over !== 0 || obj.count_heart !== 0 ) {
                dbs.Game.update({
                    count_over: Sequelize.literal(`count_over + ${obj.count_over}`),
                    count_heart: Sequelize.literal(`count_heart + ${obj.count_heart}`),
                }, { id });
                obj.count_over = 0;
                obj.count_heart = 0;
            }
        })

        _.forEach(this.game_emotion, async (obj: any, id: any) => {
            if ( _.some(obj, v => v != 0) ) {
                await dbs.GameEmotion.getTransaction(async (transaction: Transaction) => {
                    let gameEmotion = await dbs.GameEmotion.findOne({ id }, transaction);
                    if ( !gameEmotion ) {
                        gameEmotion = await dbs.GameEmotion.create({ game_id: id }, transaction);
                    }
                    for ( let e in obj ) {
                        if ( obj.hasOwnProperty(e) ) {
                            gameEmotion[e] += obj[e];
                            obj[e] = 0;
                        }
                    }
                    await gameEmotion.save({ transaction });
                })
            }
        })
    }


    private getGameIds = (id: number) => {
        return this.game_ids[id] = this.game_ids[id] || {
            count_over: 0,
            count_heart: 0,
        }
    }
    private getGameEmotions = (id: number) => {
        return this.game_emotion[id] = this.game_emotion[id] || {
            e1: 0,
            e2: 0,
            e3: 0,
            e4: 0,
            e5: 0,
        }
    }


    async gameOver(message: string) {
        const { user_uid, game_id, score }: any = JSON.parse(message);
        const game = this.getGameIds(game_id);
        game.count_over += 1;
    }


    async gameHeart(message: string) {
        const { user_uid, game_id, activated }: any = JSON.parse(message);
        const game: any = this.getGameIds(game_id);
        game.count_heart += activated? 1 : -1;
    }


    async gameEmotion(message: string) {
        const { game_id, emotion, activated }: any = JSON.parse(message);
        const game: any = this.getGameEmotions(game_id);
        game[emotion] += activated? 1 : -1;
    }
}


export default new ApiMQ()
