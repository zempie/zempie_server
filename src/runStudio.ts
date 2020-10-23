import { IServerOptions } from './commons/interfaces'
import StudioServer from './servers/studioServer';
import cfgOption from '../config/opt';


(async () => {
    const apiServer = new StudioServer();

    const options : IServerOptions = {
        tcp: false,
        static_path: [
            { path: '/', route: 'public' },
        ],
    };
    await apiServer.initialize(options);
    await apiServer.start(cfgOption.Server.studio.port);


})();
