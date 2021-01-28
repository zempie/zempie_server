import * as _ from 'lodash';
import { SrvMQ } from './_srvMQ';
import { caches, dbs } from '../../commons/globals';
import { Sequelize } from 'sequelize';


class ContentMQ extends SrvMQ {
    private interval: NodeJS.Timeout;
    private game_over: {[key: string]: number} = {};
    private game_heart: {[Key: string]: number} = {};

    private game_ids: {[Key: number]: {
            game_over: number,
            game_heart: number,
        }} = {};

    constructor() {
        super();

        this.interval = setInterval(() => {
            this.processBulk();
        }, 1000 * 10);
    }

    private processBulk = async () =>{
        // const games = await caches.game.getList();
        _.forEach(this.game_ids, async (obj: any, id: any) => {
            if ( obj.game_over > 0 || obj.game_heart > 0 ) {
                dbs.Game.update({
                    count_over: Sequelize.literal(`count_over + ${obj.game_over}`),
                    count_heart: Sequelize.literal(`count_heart + ${obj.game_heart}`),
                }, { id });
                obj.count_over = 0;
                obj.count_heart = 0;
            }
        })
        // _.forEach(this.game_over, async (count, id) => {
        //     if ( count > 0 ) {
        //         dbs.Game.update({
        //             count_over: Sequelize.literal(`count_over + ${count}`),
        //             count_heart: Sequelize.literal(`count_heart + ${count}`),
        //         }, { id })
        //         this.game_over[id] = 0;
        //         console.log('[gameOver] id:', id)
        //         // const game = _.find(games, game => game.game_uid === uid);
        //         // if ( game ) {
        //         //     game.count_over += count;
        //         // }
        //     }
        // })
        // caches.game.setList(games);
    }

    async gameOver(message: string) {
        // console.log('message:'.yellow, message);
        const { user_uid, game_id, score }: any = JSON.parse(message);
        // const user = await dbs.User.findOne({ id: user_id });
        // const game = await dbs.Game.findOne({ game_id });
        // const game_uid = game.uid;

        // await TimelineController.doPosting({type: eTimeline.PR, score, game_uid, game_id, user_id}, user);
        this.game_over[game_id] = this.game_over[game_id] || 0;
        this.game_over[game_id] += 1;

        console.log('consume:', game_id);
    }


    async gameHeart(message: string) {
        const { user_uid, game_id, activated }: any = JSON.parse(message);

        this.game_heart[game_id] = this.game_heart[game_id] || 0;
        if ( activated ) {
            this.game_heart[game_id] += 1;
        }
        else {
            this.game_heart[game_id] -= 1;
        }
    }
}


export default new ContentMQ()
