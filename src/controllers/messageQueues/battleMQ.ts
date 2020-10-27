import { SrvMQ } from './_srvMQ';
import { Message } from 'kafka-node';
import { dbs } from '../../commons/globals';
import { Transaction } from 'sequelize';


class BattleMQ extends SrvMQ {
    async battle_gameOver (message: Message) {
        const { battle_uid, user_uid, secret_id, best_score, score }: any = message;

        await dbs.BattleLog.updateScore({ id: secret_id, score });

        // timeline
    }
}


export default new BattleMQ()
