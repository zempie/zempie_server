import { IServerOptions } from './commons/interfaces'
import AdminServer from './servers/adminServer';
import cfgOption from '../config/opt';


(async () => {
    const apiServer = new AdminServer();
    const options : IServerOptions = {
        tcp: false,
        static_path: [
            { path: '/', route: 'public' },
        ],
    };

    await apiServer.initialize(options);
    await apiServer.start(cfgOption.Server.admin.port);
})();
