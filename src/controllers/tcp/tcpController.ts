import WSController, { zWS } from './wsController';
import tcpRoomManager from '../../services/tcpRoomManager';
import { SendPacket } from '../../services/packetService';
import { logger } from '../../commons/logger';
import { Request } from 'express';
import * as ws from 'ws';

export class gWS extends zWS {
    gameData!: {
        game_id: string;
        num: string;
        room_id: string;
        save_data: { [key: string]: any };
    };
}

class TcpController extends WSController {
    protected onClosed = (ws: ws): void => {
        tcpRoomManager.leave(ws as gWS);
    };

    protected onConnected = (ws: ws, req: Request): void => {
        const zws = ws as gWS;
        zws.gameData = {
            game_id: req.params.pathname,
            num: (req.params.num || 2).toString(),
            room_id: '',
            save_data: {},
        };

        logger.debug(`[zWS] connected pathname:`, zws.gameData?.game_id);
        SendPacket(ws, 'open_ok', { uid: zws.uid });
    };

    protected onMessage = (ws: ws, message: string): void => {
        logger.debug(message);
        const packet = JSON.parse(message);
        switch (packet.head) {
            case 'enter':
                tcpRoomManager.enter(ws as gWS);
                break;

            case 'leave':
                tcpRoomManager.leave(ws as gWS);
                break;

            default:
                tcpRoomManager.play(ws as gWS, packet.body);
        }
    };
}

export default new TcpController();
