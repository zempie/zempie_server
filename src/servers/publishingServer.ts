import Server from './server';
import { IMessageQueueOptions, IServerOptions } from '../commons/interfaces';
import mq from '../controllers/messageQueues/publishMQ'


class PublishingServer extends Server {
    protected afterStart = async () => {
        const options: IMessageQueueOptions = {
            groupId: 'pub-server',
            autoCommit: true,
            onMessage: mq.onMessage.bind(mq),
            addTopics: mq.addTopics(),
        }
        await this.setMessageQueue(options)
    }
}


export default PublishingServer
