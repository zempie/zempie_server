import APIServer from './servers/apiServer'
import { IServerOptions } from './commons/interfaces'
import cfgOption from '../config/opt';


(async () => {
    const apiServer = new APIServer();
    const options : IServerOptions = {
        tcp: false,
        port: cfgOption.Server.http.port,
        static_path: [
            { path: '/', route: 'public' },
        ],
    };

    await apiServer.initialize(options);
    await apiServer.start();
})();
