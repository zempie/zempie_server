import { IServerOptions } from './commons/interfaces'
import AdminServer from './servers/adminServer';
import cfgOption from '../config/opt';


(async () => {
    const options : IServerOptions = {
        tcp: false,
        port: cfgOption.Server.admin.port,
        static_path: [
            { path: '/', route: 'public' },
        ],
        rdb: true,
        mdb: true,
        swagger: true,
        graphql: true,
    };
    const apiServer = new AdminServer();
    await apiServer.initialize2(options);
    await apiServer.start();
})();
