import APIServer from './servers/apiServer'
import { IServerOptions } from './commons/interfaces'
import mq from './controllers/messageQueues/apiSrvMQ'


(async () => {
    const apiServer = new APIServer();
    const options : IServerOptions = {
        tcp: false,
        static_path: [
            { path: '/', route: 'public' },
        ],
        messageQueue: {
            groupId: 'api-server',
            autoCommit: true,
            onMessage: mq.onMessage,
        }
    };

    await apiServer.initialize(options);
    await apiServer.start();
})();
