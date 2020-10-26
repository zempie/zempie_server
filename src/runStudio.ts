import { IServerOptions } from './commons/interfaces'
import StudioServer from './servers/studioServer';
import cfgOption from '../config/opt';


(async () => {
    const apiServer = new StudioServer();
    const options : IServerOptions = {
        tcp: false,
        port: cfgOption.Server.studio.port,
        static_path: [
            { path: '/', route: 'public' },
        ],
    };

    await apiServer.initialize(options);
    await apiServer.start();


})();
