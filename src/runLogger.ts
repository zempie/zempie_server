import LogServer from './servers/logServer';
import { IServerOptions } from './commons/interfaces';


(async () => {
    const logServer = new LogServer();
    const options: IServerOptions = {
        tcp: false,
        port: 8284,
    }

    await logServer.initialize(options);
    await logServer.start()
})();
