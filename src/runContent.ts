import ContentServer from './servers/contentServer';
import { IServerOptions } from './commons/interfaces';
import cfgOption from '../config/opt';
import mq from './controllers/messageQueues/contentSrvMQ'


(async () => {
    const contentServer = new ContentServer();
    const options: IServerOptions = {
        tcp: false,
        messageQueue: {
            groupId: 'content-server',
            autoCommit: false,
            onMessage: mq.onMessage
        }
    }

    await contentServer.initialize(options)
    await contentServer.start(cfgOption.Server.content.port);
})()
