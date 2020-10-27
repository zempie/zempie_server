import ContentServer from './servers/contentServer';
import { IServerOptions } from './commons/interfaces';
import cfgOption from '../config/opt';


(async () => {
    const contentServer = new ContentServer();
    const options: IServerOptions = {
        tcp: false,
        port: cfgOption.Server.content.port,
    }

    await contentServer.initialize(options)
    await contentServer.start();
})();
