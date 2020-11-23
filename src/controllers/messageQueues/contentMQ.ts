import * as _ from 'lodash';
import { Message } from 'kafka-node';
import { SrvMQ } from './_srvMQ';
import TimelineController from '../timelineController';
import { eTimeline } from '../../commons/enums';
import { dbs } from '../../commons/globals';
import { Sequelize } from 'sequelize';


class ContentMQ extends SrvMQ {
    private interval: NodeJS.Timeout;
    private game_over: {[key: string]: number} = {};

    constructor() {
        super();

        this.interval = setInterval(() => {
            this.processBulk();
        }, 1000 * 60);
    }

    private processBulk = () =>{
        _.forEach(this.game_over, (uid) => {
            if ( this.game_over[uid] > 0 ) {
                dbs.Game.update({
                    game_over: Sequelize.literal(`count_over + ${this.game_over[uid]}`)
                }, { uid })
                this.game_over[uid] = 0;
            }
        })
    }

    async gameOver(message: Message) {
        const { user_uid, game_uid, score }: any = message;
        // const user = await dbs.User.findOne({ id: user_id });
        // const game = await dbs.Game.findOne({ game_id });
        // const game_uid = game.uid;

        // await TimelineController.doPosting({type: eTimeline.PR, score, game_uid, game_id, user_id}, user);
        this.game_over[game_uid] = this.game_over[game_uid] || 0;
        this.game_over[game_uid] += 1;
    }
}


export default new ContentMQ()
