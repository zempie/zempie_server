import { Router } from 'express';
import Server from './server';
import contentRoute from '../routes/contentRoute';
import { IMessageQueueOptions, IServerOptions } from '../commons/interfaces';
import mq from '../controllers/messageQueues/contentMQ';


class ContentServer extends Server {
    initialize = async (options: IServerOptions) => {
        this.options = options;

        this.setExpress(options)
    }

    protected routes(app: Router) {
        super.routes(app);

        contentRoute(app);
    }

    protected afterStart = async (): Promise<void> => {
        const options: IMessageQueueOptions = {
            groupId: 'content-server',
            autoCommit: true,
            onMessage: mq.onMessage,
            addTopics: mq.addTopics(),
        }
        await this.setMessageQueue(options);
    }
}


export default ContentServer
