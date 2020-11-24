import * as _ from 'lodash';
import { SrvMQ } from './_srvMQ';
import { caches, dbs } from '../../commons/globals';
import { Sequelize } from 'sequelize';


class ContentMQ extends SrvMQ {
    private interval: NodeJS.Timeout;
    private game_over: {[key: string]: number} = {};

    constructor() {
        super();

        this.interval = setInterval(() => {
            this.processBulk();
        }, 1000 * 10);
    }

    private processBulk = async () =>{
        const games = await caches.game.getList();
        _.forEach(this.game_over, async (count, uid) => {
            if ( count > 0 ) {
                dbs.Game.update({
                    count_over: Sequelize.literal(`count_over + ${count}`)
                }, { uid })
                this.game_over[uid] = 0;
                console.log('[gameOver] uid:', uid)
                const game = _.find(games, game => game.game_uid === uid);
                if ( game ) {
                    game.count_over += count;
                }
            }
        })
        caches.game.setList(games);
    }

    async gameOver(message: string) {
        // console.log('message:'.yellow, message);
        const { user_uid, game_uid, score }: any = JSON.parse(message);
        // const user = await dbs.User.findOne({ id: user_id });
        // const game = await dbs.Game.findOne({ game_id });
        // const game_uid = game.uid;

        // await TimelineController.doPosting({type: eTimeline.PR, score, game_uid, game_id, user_id}, user);
        this.game_over[game_uid] = this.game_over[game_uid] || 0;
        this.game_over[game_uid] += 1;

        console.log('consume:', game_uid);
    }
}


export default new ContentMQ()
