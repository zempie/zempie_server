import { RouterLike } from 'express-ws';
import TcpController from '../controllers/tcp/tcpController';
import TcpMatchController from '../controllers/tcp/tcpMatchController';

export default (router: RouterLike) => {
    router.ws(`/tcp/game/:pathname`, TcpController.connected);
    router.ws(`/tcp/game/:pathname/:num`, TcpController.connected);
    router.ws(`/tcp/match`, TcpMatchController.connected);
};
