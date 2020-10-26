import { SrvMQ } from './_srvMQ';
import { Message } from 'kafka-node';
import { dbs } from '../../commons/globals';


class LogMQ extends SrvMQ {
    async gameOver(message: Message) {
        console.log('[log]', message)
        // const { user_id, game_id, score }: any = message;
        // await dbs.GameLog.create({
        //     user_id,
        //     game_id,
        //     score
        // });
    }
}


export default new LogMQ()
