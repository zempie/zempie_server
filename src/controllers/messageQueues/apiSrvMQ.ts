import * as _ from 'lodash';
import { Message } from 'kafka-node';


class ApiSrvMQ {
    onMessage (message: Message) {
        const func = _.camelCase(message.topic);

        // @ts-ignore
        return this[func](message)
    }


    gameOver(message: Message) {
        console.log('[api - gameOver]', message)
    }
}


export default new ApiSrvMQ()
