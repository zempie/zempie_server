import PublishingServer from './servers/publishingServer';
import { IServerOptions } from './commons/interfaces';


(async () => {
    const pubServer = new PublishingServer();
    const options: IServerOptions = {
        tcp: false,
        port: 8285,
    }

    await pubServer.initialize(options)
    await pubServer.start();
})();
