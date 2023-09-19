import { GameRoomIDBody, SCProtocol } from './../tcpProtocols';
import { mWS } from './../../controllers/tcp/tcpMatchController';
import MatchManager, { PvpGameType } from '../tcpMatchManager';
import { PvpGame1 } from './pvpGame';
import { PvpGame } from './pvpGameBase';
import { ReasonBody, UpdateGameScoreBody } from '../tcpProtocols';
import { SendPacket } from '../packetService';

export interface PvpGameOption {
    game_type: PvpGameType;
    users?: mWS[];
}
class PvpGameManager {
    private game_rooms: PvpGame[] = [];

    enter(option: PvpGameOption) {
        switch (option.game_type) {
            case PvpGameType.Game1:
                if (option.users) {
                    const game_room = new PvpGame1(option.users, {
                        onGameEnd: () => {
                            this.onGameEnd(game_room);
                        },
                    });
                    this.game_rooms.push(game_room);
                }
                break;
        }
    }

    updateScore(user: mWS, option: UpdateGameScoreBody) {
        const game_id = option.game_id || 0;
        const room = this.game_rooms.find((item) => item.id === game_id);
        if (room == null) {
            const body: ReasonBody = {
                reason: `Can not found room`,
            };
            SendPacket(user, SCProtocol.GAME_ROOM_SCORE_UPDATE_FAIL, body);
            return;
        }
        room.updateScore(user, option.score || 0);
    }

    gameOver(user: mWS, option: GameRoomIDBody) {
        const game_id = option.game_id || 0;
        const room = this.game_rooms.find((item) => item.id === game_id);
        if (room == null) {
            return;
        }
        room.gameOver(user);
    }

    private async onGameEnd(game: PvpGame) {
        const idx = this.game_rooms.indexOf(game);
        this.game_rooms.splice(idx, 1);

        let score_total = game.players.reduce((score, curPlayer) => {
            return (score += curPlayer.score);
        }, 0);

        const score_avg = score_total / game.players.length;

        const allPlayerIds = game.players.map((item) => item.ws.userData.id);

        for (const player of game.players) {
            let result = 0.5;
            if (score_avg > player.score) result = 0;
            else if (score_avg < player.score) result = 1;

            const enemy = allPlayerIds.filter((item) => item !== player.ws.userData.id);

            await MatchManager.updateEloWithGameResult(player.ws.userData.id, enemy, result, game.game_type);
        }
    }

    disconnected(ws: mWS) {
        const rooms = this.game_rooms.filter((room) => room.players.find((player) => player.ws === ws) != null);
        for (const room of rooms) {
            this.gameOver(ws, { game_id: room.id });
        }
    }
}

export default new PvpGameManager();
