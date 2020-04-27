import APIServer from './servers/apiServer'
import { IServerOptions } from './commons/interfaces'



(async () => {
    const apiServer = new APIServer();

    const options : IServerOptions = {
        tcp: false,
        static_path: [
            { path: '/', route: 'public' },
        ],
    };
    await apiServer.initialize(options);

    await apiServer.start(options);


})();
