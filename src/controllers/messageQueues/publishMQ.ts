import { SrvMQ } from './_srvMQ';
import { Message } from 'kafka-node';


class PublishMQ extends SrvMQ {
    gameOver(message: Message) {
        console.log('[pub]', message)
    }
}


export default new PublishMQ()
