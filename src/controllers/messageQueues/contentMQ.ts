import * as _ from 'lodash';
import { Message } from 'kafka-node';
import { SrvMQ } from './_srvMQ';
import TimelineController from '../timelineController';
import { eTimeline } from '../../commons/enums';
import { dbs } from '../../commons/globals';
import user from '../../database/mysql/models/user/user';


class ContentMQ extends SrvMQ {
    async gameOver(message: Message) {
        console.log('[con]', message)
        // const { user_id, game_id, score }: any = message;
        // const user = await dbs.User.findOne({ id: user_id });
        // const game = await dbs.Game.findOne({ game_id });
        // const game_uid = game.uid;
        //
        // await TimelineController.doPosting({type: eTimeline.PR, score, game_uid, game_id, user_id}, user);
    }
}


export default new ContentMQ()
