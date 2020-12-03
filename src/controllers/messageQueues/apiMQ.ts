import * as _ from 'lodash';
import { Message } from 'kafka-node';
import { SrvMQ } from './_srvMQ';


class ApiMQ extends SrvMQ {
    // gameOver (message: Message) {
    //     console.log('[api - gameOver]', message)
    // }
}


export default new ApiMQ()
