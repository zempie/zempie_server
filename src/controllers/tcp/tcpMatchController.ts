import { SCProtocol, CSProtocol, ReasonBody } from './../../services/tcpProtocols';
import WSController, { zWS } from './wsController';
import { SendPacket } from '../../services/packetService';
import { logger } from '../../commons/logger';
import { dbs, caches, docs } from '../../commons/globals';
import * as admin from 'firebase-admin';
import MatchManager, { PvpGameType } from '../../services/tcpMatchManager';
import PvpGameManager from '../../services/pvp/pvpGameManager';

export class mWS extends zWS {
    isValid: boolean = false;
    userData!: any;
}

class TcpMatchController extends WSController {
    private allowUnatholizationHead: string[] = ['token'];

    protected onClosed = (ws: zWS): void => {
        const mws = ws as mWS;
        MatchManager.disconnected(mws);
        PvpGameManager.disconnected(mws);
    };

    protected onConnected = (ws: zWS): void => {
        SendPacket(ws, SCProtocol.OPEN_OK, { uid: ws.uid });
    };

    protected onMessage = async (ws: zWS, message: string): Promise<void> => {
        const mws = ws as mWS;
        logger.debug(message);
        const packet = JSON.parse(message);
        if (!this.allowUnatholizationHead.includes(packet.head) && !mws.isValid) {
            const body: ReasonBody = { reason: 'Autholization Error!' };
            SendPacket(mws, SCProtocol.ERROR, body);
            return;
        }
        switch (packet.head) {
            case CSProtocol.AUTHOLIZATION:
                try {
                    const { uid } = await admin.auth().verifyIdToken(packet.body.token || '');
                    mws.userData = await dbs.User.getInfo({ uid });
                    mws.isValid = true;
                } catch (e) {
                    SendPacket(ws, SCProtocol.AUTHOLIZATION_FAIL);
                    mws.close(1000, 'autholization fail');
                }
                SendPacket(ws, SCProtocol.AUTHOLIZATION_SUCCESS);
                break;
            case CSProtocol.WAITING_ROOM_ENTER:
                MatchManager.matchRoomEnter(mws, packet.body);
                break;
            case CSProtocol.WAITING_ROOM_LEAVE:
                MatchManager.matchRoomLeave(mws, packet.body);
                break;
            case CSProtocol.WAITING_ROOM_START_MATCHING:
                MatchManager.startMatching(mws, packet.body);
                break;
            case CSProtocol.MATCHING_ACCEPT:
                MatchManager.acceptMatch(mws, packet.body);
                break;
            case CSProtocol.MATCHING_DECLINE:
                MatchManager.declineMatch(mws, packet.body);
                break;
            case CSProtocol.GAME_ROOM_SCORE_UPDATE:
                PvpGameManager.updateScore(mws, packet.body);
                break;
            case CSProtocol.GAME_ROOM_PLAYER_GAME_OVER:
                PvpGameManager.gameOver(mws, packet.body);
                break;
            default:
                break;
        }
    };
}

export default new TcpMatchController();
