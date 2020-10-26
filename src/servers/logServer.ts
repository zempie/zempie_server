import Server from './server';
import { IMessageQueueOptions } from '../commons/interfaces';
import mq from '../controllers/messageQueues/logMQ';

class LogServer extends Server {
    protected afterStart = async () => {
        const options: IMessageQueueOptions = {
            groupId: 'log-server',
            autoCommit: false,
            onMessage: mq.onMessage.bind(mq),
            addTopics: mq.addTopics(),
        }
        await this.setMessageQueue(options);
    }
}


export default LogServer
