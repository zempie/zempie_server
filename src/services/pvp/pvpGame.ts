import { GameRoomBaseInfoBody, ReasonBody, SCProtocol } from './../tcpProtocols';
import { mWS } from './../../controllers/tcp/tcpMatchController';
import { PvpGameType } from '../tcpMatchManager';
import { PvpGameHandler, PvpPersonalGame } from './pvpGameBase';
import { SendPacket } from '../packetService';

export class PvpGame1 extends PvpPersonalGame {
    public readonly game_type: PvpGameType = PvpGameType.Game1;

    constructor(users: mWS[], handler: PvpGameHandler) {
        super(users, handler);

        for (const user of users) {
            const body: GameRoomBaseInfoBody = {
                game_type: this.game_type,
                game_id: this.id,
            };
            SendPacket(user, SCProtocol.GAME_ROOM_ENTER_SUCCESS, body);
        }
    }
}
